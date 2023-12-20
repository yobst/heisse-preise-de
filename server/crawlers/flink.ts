import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";

const storeUnits: Record<string, UnitMapping> = {
    beutel: { unit: "stk", factor: 1 },
    er: { unit: "stk", factor: 1 },
    tbl: { unit: "stk", factor: 1 },
    tabs: { unit: "stk", factor: 1 },
    "mini-tabletten": { unit: "stk", factor: 1 },
    kapseln: { unit: "stk", factor: 1 },
    wl: { unit: "wg", factor: 1 },
};

const invalidUnits = new Set(["dose", "€startguthaben"]);

export class FlinkCrawler implements Crawler {
    store = stores.flink;

    async fetchData() {
        const maxItems = 100;
        let offset = 0;
        let items: any[] = [];
        let done = false;
        while (!done) {
            const BASE_URL = `https://api.goflink.com/search-discovery/search-http/v1/search?query=&page_size=${maxItems}&offset=${offset}`;
            const resp = await get(BASE_URL, { headers: { "Hub-Slug": "de_man_nied" } });
            const currentItems = resp.data.products.length;
            items = items.concat(resp.data.products);
            offset += maxItems;
            done = currentItems < maxItems || offset >= 1000;
        }
        return items;
    }

    getCanonical(rawItem: any, today: string): Item {
        const productId = rawItem.id;
        const itemName = rawItem.name;
        const unavailable = false;
        const price = rawItem.price.amount;
        const isWeighted = false;
        const bio = rawItem.slug.includes("bio-");
        const url = `${rawItem.slug}-${rawItem.sku}/`;
        const rawCategory = rawItem.category_id;
        //const category = this.categories[rawCategory];

        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

        let rawQuantity = 1;
        let rawUnit = "stk";

        if (rawItem.slug) {
            const regex = /-(\d+)-?(g|stk|wl|mg|l|er|tbl|tabs)(?:-|$)/;
            const matches = rawItem.slug.match(regex);

            if (matches) {
                rawQuantity = parseFloat(matches[1]);
                rawUnit = matches[3];
            }
        }

        if (rawUnit == defaultUnit.unit) {
            const res = utils.extractRawUnitAndQuantityFromDescription(itemName, defaultUnit);
            rawQuantity = res.rawQuantity;
            rawUnit = res.rawUnit;
        }

        if (invalidUnits.has(rawUnit)) {
            rawQuantity = 1;
            rawUnit = "stk";
        }

        const { quantity, unit } = utils.normalizeUnitAndQuantity(
            `${rawItem.slug} ${itemName}`,
            rawUnit,
            rawQuantity,
            storeUnits,
            this.store.displayName,
            defaultUnit
        );

        return new Item(
            this.store.id,
            productId,
            itemName,
            "Unknown", // TODO: category
            unavailable,
            price,
            [{ date: today, price, unitPrice: 0.0 }],
            isWeighted,
            unit,
            quantity,
            bio,
            url
        );
    }
}
