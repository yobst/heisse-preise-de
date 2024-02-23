import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://www.lidl.de/p/api/gridboxes/DE/de";
const HITS = Math.floor(30000 + Math.random() * 2000);

const storeUnits: Record<string, UnitMapping> = {
    "": { unit: "stk", factor: 1 },
    "dosen": { unit: "stk", factor: 1 },
    "flasche": { unit: "stk", factor: 1 },
    "flaschen": { unit: "stk", factor: 1 },
    "packung": { unit: "stk", factor: 1 },
    "pkg.": { unit: "stk", factor: 1 },
    "l": { unit: "ml", factor: 1000 },
    "kg": { unit: "g", factor: 1000 },
    "-g-preis": { unit: "g", factor: 1 },
    "m²": { unit: "qm", factor: 1 },
    "m2": { unit: "qm", factor: 1 },
};

const invalidUnits = new Set(["pfand"]);


export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

    let rawQuantity = rawItem.price.packaging?.amount;
    let rawUnit = rawItem.price.packaging?.unit;

    let packaging = rawItem.price.packaging?.text?.toLowerCase() || rawItem.price?.basePrice?.text?.toLowerCase();
    if (packaging && !rawUnit) {
        if (packaging.startsWith("je") || packaging.startsWith("ca.")) {
            const firstPart = packaging.split(";")[0];
            const regex = /(?:ca\.|je)\s+((?:\d+x)*\s+)?((?:(?:(?:\d+,)?\d+)\/)*)((?:\d+,)?\d+)?\s*(\S+).*/;
            const matches = firstPart.match(regex);
    
            if (matches) {
                rawUnit = matches[4];
                rawQuantity = matches[3]? parseFloat(matches[3].replace(',','.')) : 1;
                if (matches[1] && matches[1].trim().length > 0) {
                    matches[1].split("x").forEach((q: string) => {
                        const trimmed = q.trim();
                        if (trimmed.length > 0) {
                            rawQuantity = rawQuantity * parseFloat(trimmed.replace(",","."));
                        }
                    });
                }
            }
        } else if (packaging.endsWith("-preis")) {
            let matches = packaging.split("-")
            rawUnit = matches[matches.length - 2];
            rawQuantity = parseFloat(matches[matches.length - 3]) || 1;
        }
    }

    if (!rawUnit || (rawUnit == 'stk' && rawQuantity == 1) ) {
        const description = `${rawItem.keyfacts?.supplementalDescription?.concat(" ") ?? ""}${rawItem.fullTitle}`;
        const regex = /([0-9]+)\s+Stück/;
        const matches = description.match(regex);
        rawUnit = "stk";
        rawQuantity = 1;
        if (matches) {
            rawQuantity = parseFloat(matches[1]);
        }
    }

    if (invalidUnits.has(rawUnit)) {
        rawQuantity = 1;
        rawUnit = "stk";
    }

    return utils.normalizeUnitAndQuantity(`${rawItem.fullTitle} ${rawItem.price.packaging?.text}`, rawUnit, rawQuantity, storeUnits, storeName, defaultUnit);
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
        const bio = description.toLowerCase().includes("bio");
        const unavailable = rawItem.stockAvailability.availabilityIndicator == 0;
        const category = this.categories[rawItem.category]?.code || "Unknown";
        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName); 
        const isWeighted = rawItem.price.packaging?.text?.toLowerCase().includes("g-preis") || rawItem.price?.basePrice?.text?.toLowerCase().includes("g-preis") || false;

        return new Item(
            this.store.id,
            rawItem.productId,
            rawItem.fullTitle,
            category,
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
