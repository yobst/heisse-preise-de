import { Item, Unit, UnitMapping } from "../../common/models";
import { stores } from "../../common/stores";
import { Crawler } from "./crawler";
import * as utils from "./utils";

const BASE_URL = "https://shop.rewe.de/api/products";
const MARKET_ID = "440405";
const RETRY_STATI = new Set([]);

const storeUnits: Record<string, UnitMapping> = {
    beutel: { unit: "stk", factor: 1 },
    bund: { unit: "stk", factor: 1 },
    packung: { unit: "stk", factor: 1 },
    portion: { unit: "srv", factor: 1 },
    rollen: { unit: "stk", factor: 1 },
    teebeutel: { unit: "stk", factor: 1 },
    waschgang: { unit: "wg", factor: 1 },
    portionen: { unit: "srv", factor: 1 },
    teller: { unit: "srv", factor: 1 },
};

const invalidUnits = new Set(["silber"]);

export function getQuantityAndUnit(rawItem: any, storeName: string) {
    const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

    let rawQuantity = defaultUnit.quantity;
    let rawUnit = defaultUnit.unit;

    const grammage = rawItem._embedded?.articles[0]?._embedded?.listing?.pricing?.grammage;
    if (grammage) {
        const res = utils.extractRawUnitAndQuantityFromEndOfString(grammage.split("(")[0].trim(), defaultUnit);
        rawQuantity = res.rawQuantity;
        rawUnit = res.rawUnit;
    }

    if (rawUnit == defaultUnit.unit) {
        const res = utils.extractRawUnitAndQuantityFromDescription(rawItem.productName, defaultUnit);
        rawQuantity = res.rawQuantity;
        rawUnit = res.rawUnit;
    }

    if (invalidUnits.has(rawUnit)) {
        rawQuantity = 1;
        rawUnit = "stk";
    }

    return utils.normalizeUnitAndQuantity(rawItem.name, rawUnit, rawQuantity, storeUnits, storeName, defaultUnit);
}

async function getSubcategories(categorySlug: any, storeID: string, IDprefix = "", level = 0) {
    const page = `${BASE_URL}?objectsPerPage=1&page=1&categorySlug=${categorySlug}`;
    const resp = await utils.get(page, storeID, RETRY_STATI);
    const rawCategories = resp.data?.facets.find((item: any) => item.name == "CATEGORY")?.facetConstraints;

    let category = rawCategories[0];
    for (let i=0; i<level; ++i) {
        category = category.subFacetConstraints[0];
    }

    const path = `${IDprefix}${category.name}/`;
    const categories = [
        {
            id: path,
            name: category.name,
            facetFilterQuery: category.facetFilterQuery,
            slug: category.slug,
            active: true,
            code: null,
        }
    ];
    for (const subcategory of (category.subFacetConstraints || [])) {
        const subCategories = await getSubcategories(subcategory.slug, storeID, path, level + 1);
        categories.push(...subCategories);
    }
    return categories;
}

export class ReweCrawler implements Crawler {
    store = stores.rewe;
    categories: Record<string, any> = {};
    topLevelCategories: string[] = [];

    async getTopLevelCategories() {
        if (this.topLevelCategories.length == 0) {
            const page = `${BASE_URL}?objectsPerPage=1&page=1&market=${MARKET_ID}`;
            const resp = await utils.get(page, this.store.id, RETRY_STATI);
            const data = resp.data?.facets.find((item: any) => item.name == "CATEGORY")?.facetConstraints;
            this.topLevelCategories = data?.map((category: any) => category.slug) || [];
        }
        return this.topLevelCategories;
    }

    async fetchCategories() {
        const categories: Record<string, any> = {};
        for (let categorySlug of await this.getTopLevelCategories()) {
            const subCategories = await getSubcategories(categorySlug, this.store.id);
            for (const subcategory of subCategories) {
                categories[subcategory.id] = subcategory;
            }
        }
        return categories;
    }

    async fetchData() {
        const pageLimit = 250; // from 251 only 40 are taken???
        const maxProcessableItems = pageLimit; // 10000
        const items: any[] = [];
        const topLevelCategories = await this.getTopLevelCategories();
        while (topLevelCategories.length > 0) {
            let categorySlug = topLevelCategories.pop();
            let pageNr = 1;
            let page = `${BASE_URL}?objectsPerPage=${pageLimit}&page=${pageNr}&categorySlug=${categorySlug}&market=${MARKET_ID}&serviceTypes=PICKUP`;
            let data = (await utils.get(page, this.store.id, RETRY_STATI)).data;
            const nResults = data?.pagination.totalResultCount || 0;
            const category = data?.facets?.find((item: any) => item.name == "CATEGORY")?.facetConstraints?.find((category: any) => category.slug == categorySlug);
            if (nResults > maxProcessableItems && category?.subFacetConstraints) {
                console.log(`${this.store.id}: Calibrating category '${categorySlug}' with ${nResults}/${maxProcessableItems} processable results.`);
                const subcategories = (category?.subFacetConstraints || []).map((category: any) => category.slug);
                this.topLevelCategories = this.topLevelCategories.filter((category: any) => category.slug != categorySlug);
                this.topLevelCategories.push(...subcategories);
                topLevelCategories.push(...subcategories);
                console.log(`${this.store.id}: Replaced '${categorySlug}' with '[${subcategories}]'.`);
            }
            else {
                const nPages = data.pagination.totalPages;
                while (data && (pageNr <= nPages)) {
                    const products = data?._embedded?.products || [];
                    const pricedProducts = products.filter((item: any) => item._embedded.articles[0]);
                    items.push(...pricedProducts);
                    pageNr++;
                    page = `${BASE_URL}?objectsPerPage=${pageLimit}&page=${pageNr}&categorySlug=${categorySlug}`;
                    data = (await utils.get(page, this.store.id, RETRY_STATI)).data;
                }
            }
        }
        return items;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = (rawItem._embedded?.articles[0]?._embedded?.listing?.pricing?.currentRetailPrice || 0) / 100.0;
        const bio = (rawItem.attributes?.tags && "organic" in rawItem.attributes?.tags) || rawItem.productName.toLowerCase().includes("bio");
        // more tags: discounted, lactosefree, regional, vegan
        const unavailable = false;
        const isWeighted = false;
        const rawCategory = rawItem._embedded.categoryPath;
        const category = this.categories[rawCategory]?.code || "Unknown";
        const { quantity, unit } = getQuantityAndUnit(rawItem, this.store.displayName);

        return new Item(
            this.store.id,
            rawItem.id,
            rawItem.productName,
            category,
            unavailable,
            price,
            [{ date: today, price: price, unitPrice: 0 }],
            isWeighted,
            unit,
            quantity,
            bio,
            rawItem._links.detail.href
        );
    }
}
