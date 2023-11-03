import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import get from "axios";
import * as utils from "./utils";
import { stores } from "../../common/stores";
const HITS = Math.floor(30000 + Math.random() * 2000);

const storeUnits: Record<string, UnitMapping> = {
    "": { unit: "stk", factor: 1 },
    dosen: { unit: "stk", factor: 1 },
    flasche: { unit: "stk", factor: 1 },
    flaschen: { unit: "stk", factor: 1 },
    "pkg.": { unit: "stk", factor: 1 },
    l: { unit: "ml", factor: 1000 },
    ml: { unit: "ml", factor: 1 },
    g: { unit: "g", factor: 1 },
    kg: { unit: "g", factor: 1000 },
};

export class LidlCrawler implements Crawler {
    store = stores.lidl;

    async fetchData() {
        const LIDL_SEARCH = `https://www.lidl.de/p/api/gridboxes/DE/de/?max=${HITS}`;
        return (await get(LIDL_SEARCH)).data.filter((item: any) => !!item.price.price);
    }

    getCanonical(rawItem: any, today: string): Item {
        const price = rawItem.price.price;
        const description = rawItem.keyfacts?.description ?? "";
        const itemName = `${rawItem.keyfacts?.supplementalDescription?.concat(" ") ?? ""}${rawItem.fullTitle}`;
        const bio = itemName.toLowerCase().includes("bio");
        const unavailable = false;
        const productId = rawItem.productId;

        let rawQuantity = 1;
        let rawUnit = "";
        let isWeighted = false;

        let text = (rawItem.price.basePrice?.text ?? "").trim().split("(")[0].replaceAll(",", ".").toLowerCase();
        if (text === "per kg") {
            isWeighted = true;
            rawUnit = "kg";
        } else {
            if (text.startsWith("bei") && text.search("je ") != -1) text = text.substr(text.search("je "));

            for (let s of ["ab ", "je ", "ca. ", "z.b.: ", "z.b. "]) text = text.replace(s, "").trim();

            const regex = /^([0-9.x ]+)(.*)$/;
            const matches = text.match(regex);
            if (matches) {
                matches[1].split("x").forEach((q: string) => {
                    rawQuantity = rawQuantity * parseFloat(q.split("/")[0]);
                });
                rawUnit = matches[2].split("/")[0].trim().split(" ")[0];
            }
            rawUnit = rawUnit.split("-")[0].split(";")[0];
        }

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
        return "Unknown";
    }
}
