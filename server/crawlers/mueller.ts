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
    undefined: { unit: "stk", factor: 1 },
};

const categoriesExcludeList = ["Spielwaren", "Multi-Media", "Schreibwaren", "Strümpfe", "Handarbeit", "Bücher"];

export class MuellerCrawler implements Crawler {
    store = stores.mueller;

    async fetchData() {
        let muellerItems = [];

        const MUELLER_CATEGORY_PAGES: any[] = [];
        const data = (await get(`${exports.urlBase}/ajax/burgermenu/`)).data;
        data.forEach((category: any) => {
            if (!categoriesExcludeList.includes(category.name)) {
                const subcategories = category.subcategories.map((subcategory: any) => subcategory.url);
                MUELLER_CATEGORY_PAGES.push(...subcategories);
            }
        });

        for (let page of MUELLER_CATEGORY_PAGES) {
            let response = await get(`${page}?ajax=true&p=1`, {
                validateStatus: function (status) {
                    return (status >= 200 && status < 300) || status == 404;
                },
            });
            let backoff = 2000;
            while (response.status == 404) {
                response = await get(`${page}?ajax=true&p=1`, {
                    validateStatus: function (status) {
                        return (status >= 200 && status < 300) || status == 404;
                    },
                });
                if (response.status == 404) {
                    console.error(`Couldn't fetch ${page}?ajax=true&p=1, retrying in ${backoff / 1000}s.`);
                    await new Promise((resolve) => setTimeout(resolve, backoff));
                    backoff *= 2;
                }
            }
            const plp = response?.data?.productlistresult;

            if (plp && plp.products && plp.products.length) {
                const plpProducts = plp.products;
                muellerItems.push(...plpProducts);

                // loop throw pagination
                // start at second page
                let pages = plp.pager.maxPage;
                for (let i = 2; i < pages.length; i++) {
                    const paginatedResponse = await get(`${page}?ajax=true&p=1`);
                    const paginatedPlp = paginatedResponse?.data?.productlistresult;
                    if (paginatedPlp && paginatedPlp.products && paginatedPlp.products.length) {
                        const paginatedPlpProducts = paginatedPlp.products;
                        muellerItems.push(...paginatedPlpProducts);
                    }
                }
            }
        }

        return muellerItems;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = parseFloat(rawItem.impressionDataLayer.ecommerce.impressions[0].price);
        const itemName = rawItem.name;
        const description = itemName;
        const bio = itemName.toLowerCase().includes("bio");
        const unavailable = false;
        const productId = rawItem.productId;
        const isWeighted = false;

        let [quantity, rawUnit] = utils.parseUnitAndQuantityAtEnd(rawItem.quantityOfContent);
        const rawUnit = rawItem.quantityOfContent;
        const defaultValue: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultValue);

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

    getCategory(rawItem: any): Category {
        rawItem.impressionDataLayer.ecommerce.impressions[0].category;
        return "Unknown";
    }
}
