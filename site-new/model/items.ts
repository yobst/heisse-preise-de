import { deltaTime, log } from "../utils";
import { Item } from "./models";

const { STORE_KEYS } = require("./stores");

export async function loadItems(progress: (progress: number) => void = () => {}) {
    let start = performance.now();
    const compressedItemsPerStore: Promise<Item[]>[] = [];

    for (const store of STORE_KEYS) {
        let loadedStores = 0;
        compressedItemsPerStore.push(
            new Promise<Item[]>(async (resolve: (items: Item[]) => void) => {
                let start = performance.now();
                try {
                    const response = await fetch(`build/data/latest-canonical.${store}.compressed.json`);
                    const json = await response.json();
                    log(`Loader - loading compressed items for ${store} took ${deltaTime(start)} secs`);
                    start = performance.now();
                    let items = decompress(json);
                    log(`Loader - Decompressing items for ${store} took ${deltaTime(start)} secs`);
                    resolve(items);
                } catch (e) {
                    log(`Loader - error while loading compressed items for ${store} ${(e as any).message}`);
                    resolve([]);
                }
                const prog = (++loadedStores / STORE_KEYS.length) * 100;
                progress(prog);
            })
        );
    }

    const resolvedPromises = await Promise.all(compressedItemsPerStore);
    let items = ([] as Item[]).concat(...resolvedPromises);
    log(`Loader - loaded ${items.length} items took ${deltaTime(start).toFixed(4)} secs`);

    const result = processItems(items);
    log(`Loader - total loading took ${deltaTime(start).toFixed(4)} secs`);

    return { items: result.items.filter((item) => item.priceHistory.length > 0), lookup: result.lookup };
}

function processItems(items: Item[]) {
    const lookup: Record<string, Item> = {};
    const start = performance.now();
    const interns = new Map();
    const intern = (value: string | undefined) => {
        if (interns.has(value)) {
            return interns.get(value);
        } else {
            interns.set(value, value);
            return value;
        }
    };

    items.forEach((item) => {
        lookup[item.uniqueId] = item;
        item.store = intern(item.store);
        item.id = intern(item.id);
        item.name = intern(item.name);
        item.category = intern(item.category);
        item.price = item.price;
        for (const price of item.priceHistory) {
            price.date = intern(price.date);
            price.price = price.price;
        }
        item.priceHistory = item.priceHistory.filter((price) => price.price > 0);
        item.unit = intern(item.unit);
        item.quantity = item.quantity;

        item.search = item.name + " " + item.quantity + " " + item.unit;
        item.search = intern(item.search.toLowerCase().replace(",", "."));

        const unitPriceFactor = item.unit == "g" || item.unit == "ml" ? 1000 : 1;
        for (let i = 0; i < item.priceHistory.length; i++) {
            const price = item.priceHistory[i];
            price.unitPrice = (price.price / item.quantity) * unitPriceFactor;
        }
    });

    items.sort((a, b) => {
        if (a.store < b.store) {
            return -1;
        } else if (a.store > b.store) {
            return 1;
        }

        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        }

        return 0;
    });

    log(`Loader - processing ${items.length} items took ${deltaTime(start).toFixed(4)} secs`);
    return { items, lookup };
}

export function decompress(compressedItems: any): Item[] {
    const storeLookup = compressedItems.stores;
    const data = compressedItems.data;
    const dates = compressedItems.dates;
    const numItems = compressedItems.n;
    const items = new Array<Item>(numItems);
    let i = 0;
    for (let l = 0; l < numItems; l++) {
        const store = storeLookup[data[i++]];
        const id = data[i++];
        const name = data[i++].replace("M & M", "M&M");
        const category = data[i++];
        const unavailable = data[i++] == 1;
        const numPrices = data[i++];
        const prices = new Array(numPrices);
        for (let j = 0; j < numPrices; j++) {
            const date = dates[data[i++]];
            const price = data[i++];
            prices[j] = {
                date: date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8),
                price,
            };
        }
        const unit = data[i++];
        const quantity = data[i++];
        const isWeighted = data[i++] == 1;
        const organic = data[i++] == 1;
        const url = data[i++];

        items[l] = new Item(store, id, name, category, unavailable, prices[0].price, prices, isWeighted, unit, quantity, organic, url);
    }
    return items;
}
