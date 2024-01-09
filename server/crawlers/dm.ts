import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://product-search.services.dmtech.com/de";
const RETRY_STATI = new Set([429]);

const storeUnits: Record<string, UnitMapping> = {
    wl: { unit: "wg", factor: 1 },
    bl: { unit: "stk", factor: 1 },
    btl: { unit: "stk", factor: 1 },
    portion: { unit: "srv", factor: 1 },
    satz: { unit: "stk", factor: 1 },
    tablette: { unit: "stk", factor: 1 },
    mg: { unit: "g", factor: 0.001 },
};

function getSubcategories(category: any) {
    let categories: any[] = [];
    if (category.code) {
        categories.push({
            name: category.name,
            url: category.imageUrlTemplate,
            id: category.code,
            active: true,
            code: null,
        });
        if (category.subcategories) {
            for (const subcategory of category.subcategories) {
                categories = categories.concat(getSubcategories(subcategory));
            }
        }
    }

    return categories;
}
const categoriesIncludeList = ["Ernährung", "Baby & Kind", "Gesundheit"]; // 30000 40000 50000

export class DmCrawler implements Crawler {
    store = stores.dm;
    categories: Record<string, any> = {};

    async fetchCategories() {
        const page = `${BASE_URL}/navigationcategories`;
        const resp = await utils.get(page, this.store.id, RETRY_STATI);
        const data = resp.data;
        const categories: Record<string, any> = {};
        if (data) {
            data.forEach((category: any) => {
                let subcategories = getSubcategories(category);
                for (const subcategory of subcategories) {
                    categories[subcategory.name] = subcategory;
                }
            });
        }
        return categories;
    }

    async fetchData() {
        const urlPrefix = `${BASE_URL}/search/crawl?pageSize=1000&`;
        const queries = [
            "allCategories.id=030000&price.value.to=7", //~980 items (!)
            "allCategories.id=030000&price.value.from=7", //~500 items
            "allCategories.id=040000&price.value.to=2", //~600 items
            "allCategories.id=040000&price.value.from=2&price.value.to=4", //~900 items
            "allCategories.id=040000&price.value.from=4", //~400 items
            "allCategories.id=050000&price.value.to=2", //~850 items
            "allCategories.id=050000&price.value.from=2&price.value.to=6", //~900 items
            "allCategories.id=050000&price.value.from=6&price.value.to=10", //~850 items
            "allCategories.id=050000&price.value.from=10", //~850 items
        ];

        const dmItems: any[] = [];
        for (let query of queries) {
            const res = await utils.get(urlPrefix + query, this.store.id, RETRY_STATI);
            const items = res.data;
            if (items) {
                if (items.count > items.products.length) {
                    console.warn(
                        `DM Query matches ${items.count} items, but API only returns first ${items.products.length}. Adjust queries. Query: ${query}`
                    );
                }
                dmItems.push(...items.products);
            }
        }
        return dmItems;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.value;
        const itemName = `${rawItem.brandName} ${rawItem.name}`;
        const bio = rawItem.brandName === "dmBio" || (rawItem.name ? rawItem.name.startsWith("Bio ") || rawItem.name.startsWith("Bio-") : false);
        const unavailable = rawItem.notAvailable ? true : false;
        const productId = rawItem.gtin;
        const isWeighted = false;
        const rawCategory = rawItem.categoryNames[0];
        const category: Record<any, any> = this.categories[rawCategory];
        const rawQuantity = rawItem.netQuantityContent || rawItem.basePriceQuantity;
        const rawUnit = rawItem.contentUnit || rawItem.basePriceUnit;
        const defaultValue: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const unitAndQuantity = utils.normalizeUnitAndQuantity(rawItem.name, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultValue);

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
