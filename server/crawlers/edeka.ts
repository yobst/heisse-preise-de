import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://www.edeka.de/api";
const MARKET_ID = "10000764"

const storeUnits: Record<string, UnitMapping> = {
    gnetz: { unit: "g", factor: 1 },
    gpackung: { unit: "g", factor: 1 },
    gtafel: { unit: "g", factor: 1 },
    gbeutel: { unit: "g", factor: 1 },
    gbecher: { unit: "g", factor: 1 },
    gdose: { unit: "g", factor: 1 },
    gschale: { unit: "g", factor: 1 },
    lpackung: { unit: "ml", factor: 1000 },
    wl: { unit: "wg", factor: 1 },
};

const invalidUnits = new Set(["pfand"]);

export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
    const description = `${rawItem.title}, ${rawItem.description}`;
    let { rawUnit, rawQuantity } = utils.extractRawUnitAndQuantityFromDescription(description, defaultUnit);

    if (invalidUnits.has(rawUnit)) {
        rawQuantity = 1;
        rawUnit = "stk";
    }

    return utils.normalizeUnitAndQuantity(rawItem.name, rawUnit, rawQuantity, storeUnits, storeName, defaultUnit);
}

export class EdekaCrawler implements Crawler {
    store = stores.edeka;
    categories: Record<string, any> = {};

    async fetchCategories() {
        // No categories available on Website or in App
        return this.categories;
    }

    async fetchData() {
        const limit = 999;
        const res = await get(`${BASE_URL}/offers?limit=${limit}&marketId=${MARKET_ID}`);
        return res.data.offers;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.rawValue;
        const description = `${rawItem.title}, ${rawItem.description}`;
        const bio = description.toLowerCase().includes("bio");
        const unavailable = false;
        const isWeighted = false;
        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName);

        return new Item(
            this.store.id,
            rawItem.id,
            rawItem.title,
            "Unknown",
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unit,
            quantity,
            bio
        );
    }
}
