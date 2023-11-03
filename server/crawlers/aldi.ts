import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const storeUnits: Record<string, UnitMapping> = {};

export class AldiCrawler implements Crawler {
    store = stores.aldi;

    async fetchData() {
        let offset = 0;
        let items: any[] = [];
        let done = false;
        while (!done) {
            const ALDI_ITEM_SEARCH = `https://api.de.prod.commerce.ci-aldi.com/v1/catalog-search-product-offers?page[limit]=48&page[offset]=${offset}&merchantReference=ADG045_1`;
            const resp = (await get(ALDI_ITEM_SEARCH)).data;
            const maxpage = resp.data[0].attributes.pagination.maxPage;
            const currentpage = resp.data[0].attributes.pagination.currentPage;
            done = offset > 5000 || currentpage >= maxpage;
            items = items.concat(resp.data[0].attributes.catalogSearchProductOfferResults);
            offset += 48;
        }
        return items;
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.prices[0].grossAmount / 100;
        const isWeighted = false;
        const bio = rawItem.name.toLowerCase().includes("bio");
        const defaultValue: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        const itemName = rawItem.name;
        const description = itemName;
        const productId = rawItem.productConcreteSk;
        const unavailable = false;

        let rawUnit: string = "stk";
        let rawQuantity: number = 1;

        if (rawItem.preFormattedUnitContent) {
            const result = utils.extractRawUnitAndQuantityFromName(rawItem.preFormattedUnitContent);
            if (result) {
                rawQuantity = result.rawQuantity;
                rawUnit = result.rawUnit;
            }
        }

        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultValue);

        return new Item(
            this.store.id,
            productId,
            description,
            this.getCategory(rawItem),
            unavailable,
            price,
            [{ date: today, price, unitPrice: 0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            bio
        );
    }

    getCategory(rawItem: any): Category {
        return "Unknown";
    }
}
