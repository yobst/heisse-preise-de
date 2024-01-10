import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://api.de.prod.commerce.ci-aldi.com/v1/catalog-search-product-offers";
const MERCHANT = "ADG045_1";

const storeUnits: Record<string, UnitMapping> = {
    ea: { unit: "stk", factor: 1 },
    "er-set": { unit: "stk", factor: 1 },
    "er-packung": { unit: "stk", factor: 1 },
};

const invalidUnits = new Set(["v", "-lagig", "klingen", "-klingen"]);

export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

    let rawQuantity = 1;
    let rawUnit = "stk";

    if (rawItem.preFormattedUnitContent) {
        const res = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.preFormattedUnitContent, defaultUnit);
        rawQuantity = res.rawQuantity;
        rawUnit = res.rawUnit;
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

    return utils.normalizeUnitAndQuantity(rawItem.name, rawUnit, rawQuantity, storeUnits, storeName, defaultUnit);
}

function getSubcategories(category: any) {
    let categories = [
        {
            name: category.name,
            urlSlugText: category.urlSlugText,
            id: category.nodeId,
            categoryKey: category.categoryKey,
            active: true,
            code: null,
        },
    ];
    for (const subcategory of category.children) {
        categories = categories.concat(getSubcategories(subcategory));
    }

    return categories;
}

export class AldiCrawler implements Crawler {
    store = stores.aldi;
    categories: Record<string, any> = {};

    async fetchCategories() {
        const pageLimit = 12; // lowest possible number; allowed are 12, 16, 24, 30, 32, 48
        let categories: Record<string, any> = {};
        const page = `${BASE_URL}?page[limit]=${pageLimit}&page[offset]=0&merchantReference=${MERCHANT}`;
        const resp = (await get(page)).data;

        for (const category of resp.data[0].attributes.categoryTreeFilter) {
            if (!(category.nodeId in categories)) {
                const subcategories = getSubcategories(category);
                for (const subcategory of subcategories) {
                    categories[subcategory.id] = subcategory;
                }
            }
        }
        return categories;
    }

    async fetchData() {
        const pageLimit = 48;
        const items: any[] = [];
        for (let categoryID in this.categories) {
            const category = this.categories[categoryID];
            const categorySlug = encodeURIComponent(category.urlSlugText);
            let offset = 0;
            let done = false;
            while (!done) {
                const page = `${BASE_URL}?page[limit]=${pageLimit}&page[offset]=${offset}&merchantReference=${MERCHANT}&category_slug=${categorySlug}`;
                const resp = (await get(page)).data;
                const maxpage = resp.data[0].attributes.pagination.maxPage;
                const currentpage = resp.data[0].attributes.pagination.currentPage;
                done = offset > 5000 || currentpage >= maxpage;
                const products = resp.data[0].attributes.catalogSearchProductOfferResults;
                products.forEach((item: any) => item.category = category.id);
                items.push(...products);
                offset += pageLimit;
            }
        }
        return items;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.prices[0].grossAmount / 100;
        const isWeighted = false;
        const bio = rawItem.name.toLowerCase().includes("bio");
        const unavailable = false;
        const category = this.categories[rawItem.category] || "Unknown";
        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName);

        return new Item(
            this.store.id,
            rawItem.productConcreteSku,
            rawItem.name,
            category,
            unavailable,
            price,
            [{ date: today, price, unitPrice: 0.0 }],
            isWeighted,
            unit,
            quantity,
            bio
        );
    }
}
