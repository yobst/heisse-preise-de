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
};

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
        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const { rawUnit, rawQuantity } = utils.extractRawUnitAndQuantityFromDescription(description, defaultUnit);
        const unitAndQuantity = utils.normalizeUnitAndQuantity(description, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        return new Item(
            this.store.id,
            rawItem.id,
            rawItem.title,
            "Unknown",
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            bio
        );
    }
}
