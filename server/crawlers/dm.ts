import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://product-search.services.dmtech.com/de";

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
    if (category.has("code")) {
        categories.push({
            name: category.name,
            url: category.imageUrlTemplate,
            id: category.code,
            active: true,
            code: null,
        });
        for (const subcategory of category.subcategories) {
            categories = categories.concat(getSubcategories(subcategory));
        }
    }

    return categories;
}
const categoriesIncludeList =  ["Ernährung", "Baby & Kind", "Gesundheit"]; // 30000 40000 50000

export class DmCrawler implements Crawler {
    store = stores.dm;
    categories: Record<any, any> = [];

    async fetchCategories() {
        const page = `${BASE_URL}/navigationcategories`;
        const resp = await get(page);
        const data = resp.data;
        const categories: Record<string, any> = {};
        if (data) {
            data.forEach((category: any) => {
                if (categoriesIncludeList.includes(category.code)) {
                    let subcategories = getSubcategories(category);
                    for (const subcategory of subcategories) {
                        categories[subcategory.id] = subcategory;
                    }
                }
            });
        }
        return categories;
    }

    async fetchData() {
        const page = `${BASE_URL}/search/crawl?pageSize=1000&`;
        const QUERIES = [
            "allCategories.id=010000&price.value.to=2", //~500 items
            "allCategories.id=010000&price.value.from=2&price.value.to=3", //~600 items
            "allCategories.id=010000&price.value.from=3&price.value.to=4", //~500 items
            "allCategories.id=010000&price.value.from=4&price.value.to=6", //~800 items
            "allCategories.id=010000&price.value.from=6&price.value.to=8", //~800 items
            "allCategories.id=010000&price.value.from=8&price.value.to=10", //~900 items
            "allCategories.id=010000&price.value.from=10&price.value.to=14", //~900 items
            "allCategories.id=010000&price.value.from=14", //~300 items
            "allCategories.id=020000&price.value.to=2", //~600 items
            "allCategories.id=020000&price.value.from=2&price.value.to=3", //~550 items
            "allCategories.id=020000&price.value.from=3&price.value.to=4", //~600 items
            "allCategories.id=020000&price.value.from=4&price.value.to=6", //~800 items
            "allCategories.id=020000&price.value.from=6&price.value.to=10", //~850 items
            "allCategories.id=020000&price.value.from=10&price.value.to=18", //~900 items
            "allCategories.id=020000&price.value.from=18", //~960 items (!)
            "allCategories.id=030000&price.value.to=7", //~980 items (!)
            "allCategories.id=030000&price.value.from=7", //~500 items
            "allCategories.id=040000&price.value.to=2", //~600 items
            "allCategories.id=040000&price.value.from=2&price.value.to=4", //~900 items
            "allCategories.id=040000&price.value.from=4", //~400 items
            "allCategories.id=050000&price.value.to=2", //~850 items
            "allCategories.id=050000&price.value.from=2&price.value.to=6", //~900 items
            "allCategories.id=050000&price.value.from=6&price.value.to=10", //~850 items
            "allCategories.id=050000&price.value.from=10", //~850 items
            "allCategories.id=060000&price.value.to=3", //~940 items
            "allCategories.id=060000&price.value.from=3", //~850 items
            "allCategories.id=070000", //~300 items
        ];

        let dmItems: any[] = [];
        for (let query of QUERIES) {
            let res = await get(page + query, {
                validateStatus: function (status) {
                    return (status >= 200 && status < 300) || status == 429;
                },
            });

            // exponential backoff
            let backoff = 2000;
            while (res.status == 429) {
                console.info(`DM API returned 429, retrying in ${backoff / 1000}s.`);
                await new Promise((resolve) => setTimeout(resolve, backoff));
                backoff *= 2;
                res = await get(page + query, {
                    validateStatus: function (status) {
                        return (status >= 200 && status < 300) || status == 429;
                    },
                });
            }
            let items = res.data;
            if (items.count > items.products.length) {
                console.warn(
                    `DM Query matches ${items.count} items, but API only returns first ${items.products.length}. Adjust queries. Query: ${query}`
                );
            }
            dmItems = dmItems.concat(items.products);
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
        const rawCategory = rawItem.category_names[0];
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
