import { Category, Item, Unit, UnitMapping } from "../../common/models";
import { Crawler } from "./crawler";

import * as utils from "./utils";
import { stores } from "../../common/stores";
import util from "util";
const exec = util.promisify(require("child_process").exec);

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

export class ReweCrawler implements Crawler {
    store = stores.rewe;

    categories = [];

    async fetchCategories() {
        return [];
    }

    async fetchData() {
        // For some unholy reason, Axios returns 403 when accessing the endpoint
        // Hack: use curl...
        /*const agent = new https.Agent({
            rejectUnauthorized: false
        });
        let axiosNoDefaults = axios.create({ headers: {} });
        const headers = {
            'Rd-Service-Types': 'PICKUP',
            'Rd-Market-Id': '440405',
            "User-Agent": "curl/7.84.0"
        }
        return (await axiosNoDefaults.get('https://mobile-api.rewe.de/api/v3/product-search?searchTerm=*&page=1&sorting=RELEVANCE_DESC&objectsPerPage=250&marketCode=440405&serviceTypes=PICKUP', { headers, httpsAgent: agent })).data;*/

        try {
            let pageId = 1;
            let result = (
                await exec(
                    `curl -s "https://mobile-api.rewe.de/api/v3/product-search\?searchTerm\=\*\&page\=${pageId++}\&sorting\=RELEVANCE_DESC\&objectsPerPage\=250\&marketCode\=440405\&serviceTypes\=PICKUP" -H "Rd-Service-Types: PICKUP" -H "Rd-Market-Id: 440405"`
                )
            ).stdout;
            const firstPage = JSON.parse(result);
            const totalPages = firstPage.totalPages;
            const items = [...firstPage.products];
            for (let i = 2; i <= totalPages; i++) {
                items.push(
                    ...JSON.parse(
                        (
                            await exec(
                                `curl -s "https://mobile-api.rewe.de/api/v3/product-search\?searchTerm\=\*\&page\=${pageId++}\&sorting\=RELEVANCE_DESC\&objectsPerPage\=250\&marketCode\=440405\&serviceTypes\=PICKUP" -H "Rd-Service-Types: PICKUP" -H "Rd-Market-Id: 440405"`
                            )
                        ).stdout
                    ).products
                );
            }
            return items;
        } catch (e) {
            console.log("Failed to fetch REWE data, either CURL is not installed, or CloudFlare protection kicked in.");
            return [];
        }
    }

    getCanonical(rawItem: any, today: string): Item {
        const productId = rawItem.id;
        const itemName = rawItem.name;
        const price = Number.parseFloat(rawItem.currentPrice.split(" ")[0].replace(",", "."));
        const bio = itemName.toLowerCase().includes("bio");
        const unavailable = false;
        const isWeighted = false;

        const defaultUnit: { quantity: number; unit: Unit } = { quantity: 1, unit: "stk" };

        let rawQuantity = defaultUnit.quantity;
        let rawUnit = defaultUnit.unit;

        if (rawItem.grammage) {
            const res = utils.extractRawUnitAndQuantityFromEndOfString(rawItem.grammage.split("(")[0].trim(), defaultUnit);
            rawQuantity = res.rawQuantity;
            rawUnit = res.rawUnit;
        }

        if (rawUnit == defaultUnit.unit) {
            const res = utils.extractRawUnitAndQuantityFromDescription(rawItem.name, defaultUnit);
            rawQuantity = res.rawQuantity;
            rawUnit = res.rawUnit;
        }

        const unitAndQuantity = utils.normalizeUnitAndQuantity(itemName, rawUnit, rawQuantity, storeUnits, this.store.displayName, defaultUnit);

        return new Item(
            this.store.id,
            productId,
            itemName,
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
