import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http'

import axios from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const jar = new CookieJar();

const client = axios.create({
  httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

const BASE_URL = "https://www.mueller.de";
const RETRY_STATI = new Set([404]);

const storeUnits: Record<string, UnitMapping> = {
    wl: { unit: "wg", factor: 1 },
    bl: { unit: "stk", factor: 1 },
    btl: { unit: "stk", factor: 1 },
    portion: { unit: "srv", factor: 1 },
    satz: { unit: "stk", factor: 1 },
    tablette: { unit: "stk", factor: 1 },
    undefined: { unit: "stk", factor: 1 },
};

const categoriesIncludeList = ["Drogerie", "Genusswelt", "Naturshop"];

const subcategoriesExcludeList = [
    "Pflege",
    "Kind & Mama",
    "Gesundheit",
    "Haushalt",
    "Hygiene",
    "Accessoires",
    "Make-up",
    "Düfte & Aromen",
    "Neuheiten",
    "Bücher",
    "Bestseller",
];

function getSubcategories(category: any, IDprefix = "") {
    let categories: any[] = [];
    if (!subcategoriesExcludeList.includes(category.name)) {
        const categoryID = `${IDprefix}${category.name}`;
        categories.push({
            name: category.name,
            url: category.url,
            id: categoryID,
            active: true,
            code: null,
        });
        for (const subcategory of category.subcategories) {
            categories = categories.concat(getSubcategories(subcategory, `${categoryID}/`));
        }
    }

    return categories;
}

function valid(status: number) {
    return status >= 200 && status < 300;
}

async function getWithRetries(url: string, store: string, retryStati: Set<number>, maxTries = 10) {
    let response: Record<string, any> = {};
    for (let tries = 0, backoff = 2000; tries < maxTries; tries++, backoff *= 2) {
        response = await client.get(url, { validateStatus: (_) => true });
        if (response.status in retryStati) {
            console.error(`${store}: ${url} returned ${response.status}, retrying in ${backoff / 1000}s (${tries}/${maxTries}).`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
        } else {
            if (!valid(response.status)) {
                console.error(`${store}: Couldn't fetch ${url}, returned ${response.status}.`);
            }
            break;
        }
    }
    if (response.status in retryStati) {
        console.error(`${store}: Couldn't fetch ${url} after ${maxTries} tries, returned ${response.status}.`);
    }
    return response;
}

export class MuellerCrawler implements Crawler {
    store = stores.mueller;

    categories: Record<string, any> = {};

    async fetchCategories() {
        const response: any = await getWithRetries(`${BASE_URL}/ajax/burgermenu/`, this.store.displayName, RETRY_STATI);
        const data = response.data;
        const categories: Record<string, any> = {};
        if (data) {
            data.forEach((category: any) => {
                if (categoriesIncludeList.includes(category.name)) {
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
        // TODO: speed up
        let muellerItems: any[] = [];

        for (let categoryId of ["Drogerie/Lebensmittel", "Naturshop/Lebensmittel"]) {
            let category = this.categories[categoryId];
            let page = category.url;

            let currentPage: number = 0;
            let maxPage: number = 0;
            while (currentPage <= maxPage) {
                let response: any = await getWithRetries(`${page}?ajax=true&p=${currentPage + 1}`, this.store.displayName, RETRY_STATI);
                const plp = response.data?.productlistresult;
                if (plp && plp.pager.maxPage) {
                    maxPage = plp.pager.maxPage;
                }
                if (plp && plp.products && plp.products.length) {
                    for (let product of plp.products) {
                        product.category = categoryId;
                        muellerItems.push(product);
                    }
                    currentPage++;
                } else {
                    break;
                }
            }
        }

        return muellerItems;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = parseFloat(rawItem.impressionDataLayer.ecommerce.impressions[0].price);
        const itemName = rawItem.name;
        const bio = itemName.toLowerCase().includes("bio");
        const unavailable = rawItem.availabilityInfo ? rawItem.availabilityInfo : false;
        const isWeighted = false;
        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const { rawUnit, rawQuantity } = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.quantityOfContent, defaultUnit);
        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        let rawCategory = rawItem.impressionDataLayer.ecommerce.impressions[0].category;
        if (!(rawCategory in this.categories) && rawCategory.startsWith("Naturshop")) {
            rawCategory = rawCategory.replace("Naturshop", "Drogerie");
        }
        const category = this.categories[rawCategory]?.code || "Unknown";
        return new Item(
            this.store.id,
            rawItem.productId,
            itemName,
            category,
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0.0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            bio,
            rawItem.productUrl
        );
    }
}
