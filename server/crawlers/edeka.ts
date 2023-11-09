import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const storeUnits: Record<string, UnitMapping> = {
    gnetz: { unit: "g", factor: 1 },
    gpackung: { unit: "g", factor: 1 },
    gtafel: { unit: "g", factor: 1 },
    gbeutel: { unit: "g", factor: 1 },
};

export class EdekaCrawler implements Crawler {
    store = stores.edeka;

    async fetchData() {
        const res = await get("https://www.edeka.de/api/offers?limit=999&marketId=10000764");
        return res.data.offers;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.rawValue;
        const description = `${rawItem.title}, ${rawItem.description}`;
        const itemName = rawItem.title;
        const bio = description.toLowerCase().includes("bio");
        const unavailable = false;
        const productId = rawItem.id;
        const isWeighted = false;
        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const { rawUnit, rawQuantity } = utils.extractRawUnitAndQuantityFromDescription(description, defaultUnit);
        const unitAndQuantity = utils.normalizeUnitAndQuantity(description, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        return new Item(
            this.store.id,
            productId,
            itemName,
            this.getCategory(rawItem),
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            bio
        );
    }

    getCategory(rawItem: any): Category {
        //rawItem.category.name;
        return "Unknown";
    }
}
