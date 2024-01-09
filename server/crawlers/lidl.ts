import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://www.lidl.de/p/api/gridboxes/DE/de";
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

export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

    let rawQuantity = rawItem.price.packaging?.amount;
    let rawUnit = rawItem.price.packaging?.unit;
    console.log("1:", rawQuantity, " ", rawUnit);
    
    if (!rawUnit && rawItem.price.packaging?.text) {
        const res = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.price.packaging.text, defaultUnit);
        rawQuantity = res.rawQuantity;
        rawUnit = res.rawUnit;
    }
    console.log("2:", rawQuantity, " ", rawUnit);

    if (!rawUnit) {
        const description = `${rawItem.keyfacts?.supplementalDescription?.concat(" ") ?? ""}${rawItem.fullTitle}`;
        const regex = /([0-9]+)\s+Stück/;
        const matches = description.match(regex);
        rawUnit = "stk";
        rawQuantity = 1;
        if (matches) {
            rawQuantity = parseFloat(matches[1]);
        }
    }
    console.log("3:", rawQuantity, " ", rawUnit);

    return utils.normalizeUnitAndQuantity(
        rawItem.fullTitle, rawUnit, rawQuantity, storeUnits, storeName, defaultUnit);
}

export class LidlCrawler implements Crawler {
    store = stores.lidl;
    categories: Record<string, any> = {};

    async fetchCategories() {
        const page = `${BASE_URL}/?max=${HITS}`;
        const data = (await get(page)).data || [];
        const uniqueCategories: Set<string> = new Set(data.map((item: any) => item.category).filter((item: any) => item));

        const categories: Record<string, any> = {};
        for (let category of uniqueCategories) {

            categories[category] = {
                id: category,
                active: true,
                code: null
            }
        }
        return categories;
    }

    async fetchData() {
        const page = `${BASE_URL}/?max=${HITS}`;
        const data = (await get(page)).data || [];
        return data.filter((item: any) => !!item.price.price && item.category 
        && ( item.category.startsWith("Kategorien/Lebensmittel") || item.category.startsWith("Food") )
        );
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.price;
        const description = `${rawItem.keyfacts?.supplementalDescription?.concat(" ") ?? ""} ${rawItem.fullTitle}`;
        const itemName = rawItem.fullTitle;
        const bio = description.toLowerCase().includes("bio");
        const unavailable = rawItem.stockAvailability.availabilityIndicator == 0;
        const productId = rawItem.productId;
        const rawCategory = rawItem.category;
        const category: Record<any, any> = this.categories[rawCategory] || "Unknown";
        const isWeighted = false;
        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName); 

        return new Item(
            this.store.id,
            productId,
            itemName,
            category?.code || "Unknown",
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unit,
            quantity,
            bio,
            rawItem.canonicalUrl
        );
    }
}
