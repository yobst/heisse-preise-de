import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";
const HITS = Math.floor(30000 + Math.random() * 2000);

const storeUnits: Record<string, UnitMapping> = {
    "100ml": { unit: "ml", factor: 100 },
    "500ml": { unit: "ml", factor: 100 },
    "100g": { unit: "g", factor: 100 },
};

export class SparCrawler implements Crawler {
    store = stores.spar;

    async fetchData() {
        const SPAR_SEARCH = `https://search-spar.spar-ics.com/fact-finder/rest/v4/search/products_lmos_at?query=*&q=*&page=1&hitsPerPage=${HITS}`;
        const rawItems = (await get(SPAR_SEARCH)).data.hits;
        return rawItems?.hits || rawItems;
    }

    getCanonical(rawItem: any, today: string): Item {
        let price: number;
        let rawUnit: string = "stk";
        let rawQuantity: number = 1;

        if (rawItem.masterValues["quantity-selector"]) {
            const [str_price] = rawItem.masterValues["price-per-unit"].split("/");
            price = parseFloat(str_price.replace("€", ""));
        } else {
            price = rawItem.masterValues.price;
        }

        let description = rawItem.masterValues["short-description-3"] ?? rawItem.masterValues["short-description-2"];
        if (!description || description.length == 0) {
            description = (rawItem.masterValues["short-description"] ?? rawItem.masterValues.name).toLowerCase();
            if (description.endsWith("per kg")) [rawQuantity, rawUnit] = [1, "kg"];
            else if (description.endsWith("im topf")) [rawQuantity, rawUnit] = [1, "kg"];
            else [rawQuantity, rawUnit] = [1, "stk."];
        } else {
            const name = description.replace(" EINWEG", "").replace(" MEHRWEG", "").replace("per kg", "1 kg").trim().replace(".", "");
            const result = utils.extractRawUnitAndQuantityFromName(name);
            if (result) {
                rawQuantity = result.rawQuantity;
                rawUnit = result.rawUnit;
            }
        }

        let defaultValue: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };
        if (rawItem.masterValues["price-per-unit"]) {
            let [unitPrice, unit] = rawItem.masterValues["price-per-unit"].split("/");
            unitPrice = parseFloat(unitPrice.replace("€", ""));
            defaultValue = {
                quantity: parseFloat((price / unitPrice).toFixed(3)),
                unit: unit.toLowerCase(),
            };
        }

        const isWeighted = rawItem.masterValues["item-type"] === "WeightProduct";
        if (isWeighted) {
            rawUnit = defaultValue.unit;
            rawQuantity = defaultValue.quantity;
        }

        const itemName = rawItem.masterValues.title + " " + (rawItem.masterValues["short-description"] ?? rawItem.masterValues.name);
        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultValue);
        return new Item(
            this.store.id,
            rawItem.masterValues["product-number"],
            rawItem.masterValues.title + " " + (rawItem.masterValues["short-description"] ?? rawItem.masterValues.name),
            this.getCategory(rawItem),
            false,
            price,
            [{ date: today, price, unitPrice: 0 }],
            isWeighted,
            unitAndQuantity.unit,
            unitAndQuantity.quantity,
            rawItem.masterValues.biolevel === "Bio"
        );
    }

    getCategory(rawItem: any): Category {
        return "Unknown";
    }
}
