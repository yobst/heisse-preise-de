import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import * as utils from "./utils";
import { stores } from "../../common/stores";

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

const invalidUnits = new Set(["fach", "-fach", "-farbig", "flaschengrößen"]);

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

export class MuellerCrawler implements Crawler {
    store = stores.mueller;
    categories: Record<string, any> = {};

    async fetchCategories() {
        const response: any = await utils.get(`${BASE_URL}/ajax/burgermenu/`, this.store.displayName, RETRY_STATI);
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
        let muellerItems: any[] = [];

        for (let categoryId of ["Drogerie/Lebensmittel", "Naturshop/Lebensmittel"]) {
            let category = this.categories[categoryId];
            let page = category.url;

            let currentPage: number = 0;
            let maxPage: number = 0;
            while (currentPage <= maxPage) {
                let response: any = await utils.get(`${page}?ajax=true&p=${currentPage + 1}`, this.store.displayName, RETRY_STATI);
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
        const info = rawItem.impressionDataLayer.ecommerce.impressions[0];
        const price = parseFloat(info.price);
        const bio = info.name.toLowerCase().includes("bio");
        const unavailable = rawItem.availabilityInfo ? rawItem.availabilityInfo : false;
        const isWeighted = false;
        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

        let { rawUnit, rawQuantity } = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.quantityOfContent, defaultUnit);
        if ((rawUnit == "stk" && rawQuantity == 1) || invalidUnits.has(rawUnit)) {
            let res = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.name, defaultUnit);
            rawUnit = res.rawUnit;
            rawQuantity = res.rawQuantity;
        }

        if ((rawUnit == "stk" && rawQuantity == 1) || invalidUnits.has(rawUnit)) {
            const regex = /(?:\s|^)((?:\d+x)*\s*)?((?:(?:(?:\d+,)?\d+)\/)*)((?:\d+,)?\d+)\s*(\S+)(?:\s|$)/g;
            const matches = regex.exec(rawItem.name);
    
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
        }
        
        if (invalidUnits.has(rawUnit)) {
            rawQuantity = 1;
            rawUnit = "stk";
        }

        const { unit, quantity } = utils.normalizeUnitAndQuantity(info.name, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        let rawCategory = info.category;
        if (!(rawCategory in this.categories) && rawCategory.startsWith("Naturshop")) {
            rawCategory = rawCategory.replace("Naturshop", "Drogerie");
        }
        const category = this.categories[rawCategory]?.code || "Unknown";

        return new Item(
            this.store.id,
            info.id,
            info.name,
            category,
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0.0 }],
            isWeighted,
            unit,
            quantity,
            bio,
            rawItem.productUrl
        );
    }
}
