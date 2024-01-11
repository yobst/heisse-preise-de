import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://api.goflink.com";

const storeUnits: Record<string, UnitMapping> = {
    beutel: { unit: "stk", factor: 1 },
    "bd.": { unit: "stk", factor: 1 },
    er: { unit: "stk", factor: 1 },
    tbl: { unit: "stk", factor: 1 },
    tabs: { unit: "stk", factor: 1 },
    "mini-tabletten": { unit: "stk", factor: 1 },
    kapseln: { unit: "stk", factor: 1 },
    wl: { unit: "wg", factor: 1 },
};

const invalidUnits = new Set(["dose", "€startguthaben"]);

export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

    let rawQuantity = 1;
    let rawUnit = "stk";

    if (rawItem.slug) {
        const regex = /-(\d+)-?(g|stk|wl|mg|l|er|tbl|tabs)(?:-|$)/;
        const matches = rawItem.slug.match(regex);

        if (matches) {
            rawQuantity = parseFloat(matches[1]);
            rawUnit = matches[3];
        }
    }

    if (rawUnit == defaultUnit.unit) {
        const res = utils.extractRawUnitAndQuantityFromDescription(rawItem.name, defaultUnit);
        rawQuantity = res.rawQuantity;
        rawUnit = res.rawUnit;
    }

    if (invalidUnits.has(rawUnit)) {
        rawQuantity = 1;
        rawUnit = "stk";
    }

    return utils.normalizeUnitAndQuantity(rawItem.name, rawUnit, rawQuantity, storeUnits, storeName,  defaultUnit);
}


export class FlinkCrawler implements Crawler {
    store = stores.flink;
    categories: Record<string, any> = {};

    async fetchCategories() {
        const page = `${BASE_URL}/consumer-backend/discovery/v2/categories`;
        const resp = await get(page, { headers: { "Hub-Slug": "de_man_nied" } });
        const rawCategories = resp.data.categories.categories;

        let categories: Record<string, any> = {};
        for (let category of rawCategories) {
            if (category.subCategories) {
                for (const subcategory of category.subCategories) {
                    subcategory.active = true;
                    subcategory.code = null;
                    categories[subcategory.id] = subcategory;
                }
                delete category.subCategories;
            }
            category.active = true;
            category.code = null;
            categories[category.id] = category;
        }
        return categories;
    }

    async fetchData() {
        const maxItems = 100;
        let offset = 0;
        let items: any[] = [];
        let done = false;
        while (!done) {
            const page = `${BASE_URL}/search-discovery/search-http/v1/search?query=&page_size=${maxItems}&offset=${offset}`;
            const resp = await get(page, { headers: { "Hub-Slug": "de_man_nied" } });
            const currentItems = resp.data.products.length;
            items = items.concat(resp.data.products);
            offset += maxItems;
            // TODO: offset >= 1000 is not possible, how to get all items?
            done = currentItems < maxItems || offset >= 1000;
        }
        return items.filter((item) => item.price.amount > 0);
    }

    getCanonical(rawItem: any, today: string): Item {
        const unavailable = false;
        const price = rawItem.price.amount;
        const isWeighted = false;
        const bio = rawItem.slug.includes("bio-");
        const url = (rawItem.slug)? `${rawItem.slug}-${rawItem.sku}/` : "";

        const rawCategory = rawItem.category_id;
        let category = this.categories[rawCategory];
        if (!category) {
            for (let categoryID of rawItem.categories) {
                if (categoryID in this.categories) {
                    category = this.categories[categoryID];
                    break;
                }
            }
        }

        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName);

        return new Item(
            this.store.id,
            rawItem.id,
            rawItem.name,
            category?.code || "Unknown",
            unavailable,
            price,
            [{ date: today, price, unitPrice: 0.0 }],
            isWeighted,
            unit,
            quantity,
            bio,
            url
        );
    }
}
