import { Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const BASE_URL = "https://www.biomarkt.de/api/es/offer/_search/de";

const storeUnits: Record<string, UnitMapping> = {
    "-g-schale": { unit: "g", factor: 1 },
    "-g-packung": { unit: "g", factor: 1 },
    "er-pack": { unit: "stk", factor: 1 },
    beutel: { unit: "srv", factor: 1 },
};

const invalidUnits = new Set([]);

async function getOfferCount() {
    const resp = await get(`${BASE_URL}?index=offer&queryData=%7B%22offer%22:%7B%22marketId%22:false%7D%7D&searchLimit=1`);
    return resp.data.hits.total.value;
}

const categoriesExcludeList = new Set(["drogerie-und-kosmetik"]);

export class BiomarktCrawler implements Crawler {
    store = stores.biomarkt;
    categories: Record<any, any> = [];

    async fetchCategories() {
        const limit = await getOfferCount();
        const resp = await get(`${BASE_URL}?index=offer&queryData=%7B%22offer%22:%7B%22marketId%22:false%7D%7D&searchLimit=${limit}`);
        const categories: Record<string, any> = {};
        if (resp?.data?.hits?.hits) {
            for (let item of resp.data.hits.hits) {
                let category = item._source.productGroup;
                let categoryID = item._source.articleGroup.productGroup.order;
                categories[categoryID] = {
                    id: categoryID,
                    ref: category._ref,
                    name: item._source.articleGroup.productGroup.title,
                    key: category._key,
                    active: true,
                    code: null,
                };
            }
        }
        return categories;
    }

    async fetchData() {
        const limit = await getOfferCount();
        const resp = await get(`${BASE_URL}?index=offer&queryData=%7B%22offer%22:%7B%22marketId%22:false%7D%7D&searchLimit=${limit}`);
        let rawItems: any[] = [];
        if (resp?.data?.hits?.hits) {
            rawItems = resp.data.hits.hits
                .map((item: any) => item._source)
                .filter((item: any) => !categoriesExcludeList.has(item.productGroup._ref) && item.price);
        }
        return rawItems;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = parseFloat(rawItem.price.replace(",", "."));
        const originalPrice = rawItem.priceb ? parseFloat(rawItem.priceb.replace(",", ".")) : null;

        let rawLabels: any[] = rawItem.labels;
        const rawLabelSet = new Set(rawLabels.map((item) => item.title));
        const biolabels = {
            Bioland: "D Bioland" in rawLabelSet,
            Demeter: "Demeter internat. o. Mitglied" in rawLabelSet,
            Naturland: "D Naturland" in rawLabelSet,
            EU: "EU" in rawLabelSet || "EG-VO 2092/91 verarb. Prod." in rawLabelSet,
        };
        const hasBiolabel = Object.values(biolabels).filter((val) => val).length > 0;
        const tags = {
            bio: hasBiolabel || `${rawItem.title} ${rawItem.subtitle} ${rawItem.shordesc}`.toLowerCase().includes("bio"),
            vegan: rawItem.vegan,
            vegetarian: rawItem.vegetarian,
            lactosefree: rawItem.lactosefree,
            glutenfree: rawItem.glutenfree,
            cool: rawItem.cool,
            frozen: rawItem.frozen,
            offer: rawItem.angebotsart == "Angebot",
            fresh: rawItem.fresh,
            isWeighted: false,
            unavailable: false,
        };

        //const markets = rawItem.marketIdList.marketIds;
        //const brand = rawItem.brand;
        //const matches = `$${rawItem.subtitle} ${rawItem.shordesc}`.match(/aus (.*)/);
        //const origin = matches? matches[1]: null;
        const rawCategory = rawItem.articleGroup.productGroup.order;
        const category = this.categories[rawCategory];

        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const res = utils.extractRawUnitAndQuantityFromDescription(rawItem.subtitle, defaultUnit);
        let rawQuantity = res.rawQuantity;
        let rawUnit = res.rawUnit;

        if (rawUnit in invalidUnits) {
            rawQuantity = 1;
            rawUnit = "stk";
        }
        const { quantity, unit } = utils.normalizeUnitAndQuantity(
            rawItem.subtitle,
            rawUnit,
            rawQuantity,
            storeUnits,
            this.store.displayName,
            defaultUnit
        );

        return new Item(
            this.store.id,
            rawItem.itemno,
            rawItem.title,
            category?.code || "Unknown",
            tags.unavailable,
            price,
            [{ date: today, price, unitPrice: 0.0 }],
            tags.isWeighted,
            unit,
            quantity,
            tags.bio
        );
    }
}
