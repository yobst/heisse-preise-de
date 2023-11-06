import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const storeUnits: Record<string, UnitMapping> = {
    wl: { unit: "wg", factor: 1 },
    bl: { unit: "stk", factor: 1 },
    btl: { unit: "stk", factor: 1 },
    portion: { unit: "stk", factor: 1 },
    satz: { unit: "stk", factor: 1 },
    tablette: { unit: "stk", factor: 1 },
    mg: { unit: "g", factor: 0.001 },
};

export class DmCrawler implements Crawler {
    store = stores.dm;

    async fetchData() {
        const DM_BASE_URL = `https://product-search.services.dmtech.com/de/search/crawl?pageSize=1000&`;
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
            let res = await get(DM_BASE_URL + query, {
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
                res = await get(DM_BASE_URL + query, {
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
        console.log("Dm:", JSON.stringify(rawItem));

        const price = rawItem.price.value;
        const itemName = `${rawItem.brandName} ${rawItem.name}`;
        const description = itemName;
        const bio =
            rawItem.brandName === "dmBio" || Boolean(rawItem.name ? rawItem.name.startsWith("Bio ") | rawItem.name.startsWith("Bio-") : false);
        const unavailable = rawItem.notAvailable ? true : false;
        const productId = rawItem.gtin;
        const isWeighted = false;
        const rawQuantity = rawItem.netQuantityContent || rawItem.basePriceQuantit;
        const rawUnit = rawItem.contentUnit || rawItem.basePriceUnit;
        const defaultValue: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultValue);

        console.log(
            productId,
            itemName,
            description,
            this.getCategory(rawItem),
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            bio
        );

        return new Item(
            productId,
            itemName,
            description,
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

    getCategory(_rawItem: any): Category {
        return "Unknown";
    }
}
