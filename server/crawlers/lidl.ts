import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";
const HITS = Math.floor(30000 + Math.random() * 2000);

const storeUnits: Record<string, UnitMapping> = {
    "": { unit: "stk", factor: 1 },
    dosen: { unit: "stk", factor: 1 },
    flasche: { unit: "stk", factor: 1 },
    flaschen: { unit: "stk", factor: 1 },
    "pkg.": { unit: "stk", factor: 1 },
    l: { unit: "ml", factor: 1000 },
    ml: { unit: "ml", factor: 1 },
    g: { unit: "g", factor: 1 },
    kg: { unit: "g", factor: 1000 },
    "m²": { unit: "qm", factor: 1 },
    m2: { unit: "qm", factor: 1 },
};

export class LidlCrawler implements Crawler {
    store = stores.lidl;

    categories = [];

    async fetchCategories() {
        return [];
    }

    async fetchData() {
        const LIDL_SEARCH = `https://www.lidl.de/p/api/gridboxes/DE/de/?max=${HITS}`;
        return (await get(LIDL_SEARCH)).data.filter((item: any) => !!item.price.price);
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.price;
        const description = `${rawItem.keyfacts?.supplementalDescription?.concat(" ") ?? ""}${rawItem.fullTitle}`;
        const itemName = rawItem.fullTitle;
        const bio = description.toLowerCase().includes("bio");
        const unavailable = rawItem.stockAvailability.availabilityIndicator == 0;
        const productId = rawItem.productId;
        const rawCategory = 0; // TODO
        const category: Record<any, any> = this.categories[rawCategory];
        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

        let isWeighted = false;
        let rawQuantity = rawItem.price.packaging?.amount;
        let rawUnit = rawItem.price.packaging?.unit;

        if (!rawUnit) {
            rawUnit = "stk";
            rawQuantity = 1;
            const regex = /([0-9]+)\s+Stück/;
            const matches = description.match(regex);
            if (matches) {
                rawQuantity = parseFloat(matches[1]);
            }
        }

        const unitAndQuantity = utils.normalizeUnitAndQuantity(description, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        return new Item(
            this.store.id,
            productId,
            itemName,
            category?.code || "Unknown",
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
