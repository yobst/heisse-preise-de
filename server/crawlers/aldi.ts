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

function getSubcategories(category: any) {
    let categories = [
        {
            name: category.name,
            urlSlugText: category.urlSlugText,
            id: category.nodeId,
            categoryKey: category.categoryKey,
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

    categories = [];

    async fetchCategories() {
        const pageLimit = 12; // lowest possible number; allowed are 12, 16, 24, 30, 32, 48
        let categories: Record<number, any> = {};
        const ALDI_ITEM_SEARCH = `${BASE_URL}?page[limit]=${pageLimit}&page[offset]=0&merchantReference=${MERCHANT}`;
        const resp = (await get(ALDI_ITEM_SEARCH)).data;

        for (const category of resp.data[0].attributes.categoryTreeFilter) {
            if (!(category.nodeId in categories)) {
                const subcategories = getSubcategories(category);
                for (const subcategory of subcategories) {
                    categories[subcategory.id] = subcategory;
                }
            }
        }
        console.log(`Found ${Object.keys(categories).length} categories for Aldi`);
        console.log(Object.values(categories));

        return Object.values(categories);
    }

    async fetchData() {
        const pageLimit = 48;
        let offset = 0;
        let items: any[] = [];
        let done = false;
        while (!done) {
            const ALDI_ITEM_SEARCH = `${BASE_URL}?page[limit]=${pageLimit}&page[offset]=${offset}&merchantReference=${MERCHANT}`;
            const resp = (await get(ALDI_ITEM_SEARCH)).data;
            const maxpage = resp.data[0].attributes.pagination.maxPage;
            const currentpage = resp.data[0].attributes.pagination.currentPage;
            done = offset > 5000 || currentpage >= maxpage;
            items = items.concat(resp.data[0].attributes.catalogSearchProductOfferResults);
            offset += pageLimit;
        }
        return items;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.prices[0].grossAmount / 100;
        const isWeighted = false;
        const bio = rawItem.name.toLowerCase().includes("bio");
        const itemName = rawItem.name;
        const productId = rawItem.productConcreteSku;
        const unavailable = false;
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

        const { quantity, unit } = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        return new Item(
            this.store.id,
            productId,
            itemName,
            this.getCategory(rawItem),
            unavailable,
            price,
            [{ date: today, price, unitPrice: 0.0 }],
            isWeighted,
            unit,
            quantity,
            bio
        );
    }

    getCategory(_rawItem: any): Category {
        //return categories[]; // TODO
        return "Unknown";
    }
}
