import * as fs from "fs";
const fsAsync = fs.promises;
import * as zlib from "zlib";
import { promisify } from "util";
import { crawlers } from "./crawlers";
import { Item } from "../common/models";
import { STORE_KEYS } from "../common/stores";
import * as pg from "../common/postgresql";

const BROTLI_OPTIONS = {
    params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 9,
        [zlib.constants.BROTLI_PARAM_LGWIN]: 22,
    },
};
const brotliDecompressAsync = promisify(zlib.brotliDecompress);

export const FILE_COMPRESSOR = "br";

export function readJSON(file: string) {
    let data = fs.readFileSync(file);
    if (file.endsWith(".br")) data = zlib.brotliDecompressSync(data);
    return JSON.parse(data as any);
}

export async function readJSONAsync(file: string) {
    let data = await fsAsync.readFile(file);
    if (file.endsWith(".br")) data = await brotliDecompressAsync(data);
    return JSON.parse(data as any);
}

export function writeJSON(file: string, data: any, fileCompressor = false, spacer = 2, compressData = false) {
    if (compressData) data = compress(data);
    data = JSON.stringify(data, null, spacer);
    if (fileCompressor) data = zlib.brotliCompressSync(data, BROTLI_OPTIONS);
    fs.writeFileSync(`${file}${fileCompressor ? "." + FILE_COMPRESSOR : ""}`, data);
}

function currentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getCanonicalFor(store: string, rawItems: any[], today: string) {
    const canonicalItems = [];
    for (let i = 0; i < rawItems.length; i++) {
        let item = crawlers[store].getCanonical(rawItems[i], today);
        canonicalItems.push(item);
    }
    return canonicalItems;
}

function mergePriceHistory(oldItems: Item[], items: Item[]) {
    if (oldItems == null) return items;

    const lookup = new Map<string, Item>();
    for (const oldItem of oldItems) {
        oldItem.unavailable = false;
        lookup.set(oldItem.uniqueId, oldItem);
    }

    for (const item of items) {
        let oldItem = lookup.get(item.uniqueId);
        lookup.delete(item.uniqueId);

        let currPrice = item.priceHistory[0];
        if (oldItem) {
            if (oldItem.priceHistory[0].price == currPrice.price) {
                item.priceHistory = oldItem.priceHistory;
                continue;
            }

            for (const oldPrice of oldItem.priceHistory) {
                item.priceHistory.push(oldPrice);
            }
        }
    }

    console.log(`${lookup.size} not in latest list.`);
    let removed: Record<string, number> = {};
    for (const key of lookup.keys()) {
        const item = lookup.get(key);
        if (!item) continue;
        if (crawlers[item.store].store.removeOld) {
            removed[item.store] = removed[item.store] ? removed[item.store] + 1 : 1;
        } else {
            if (item) {
                item.unavailable = true;
                items.push(item);
            }
        }
    }
    console.log("Removed items for discount-only stores");
    console.log(JSON.stringify(removed, null, 2));

    sortItems(items);
    console.log(`Items: ${items.length}`);

    return items;
}

function sortItems(items: Item[]) {
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
}

// Keep this in sync with items.js:decompress
export function compress(items: Item[]) {
    const compressed = {
        stores: STORE_KEYS,
        n: items.length,
        dates: new Array<string>(),
        data: new Array<any>(),
    };
    const uniqueDates: Record<string, number> = {};
    for (const item of items) {
        item.priceHistory.forEach((price) => (uniqueDates[price.date.replaceAll("-", "")] = 0));
    }
    const dates = (compressed.dates = Object.keys(uniqueDates).sort());
    dates.forEach((date, index) => {
        uniqueDates[date] = index;
    });
    const data = compressed.data;
    for (const item of items) {
        data.push(STORE_KEYS.indexOf(item.store));
        data.push(item.id);
        data.push(item.name);
        data.push(item.category ?? "A0");
        data.push(item.unavailable ? 1 : 0);
        data.push(item.priceHistory.length);
        for (const price of item.priceHistory) {
            data.push(uniqueDates[price.date.replaceAll("-", "")]);
            data.push(price.price);
        }
        data.push(item.unit);
        data.push(item.quantity);
        data.push(item.isWeighted ? 1 : 0);
        data.push(item.isOrganic ? 1 : 0);
        data.push(item.url?.replace(crawlers[item.store].store.productUrlBase, "") ?? "");
    }
    return compressed;
}

async function updateCategories(dataDir: string, store: string) {
    console.log(`Started updating categories for ${store}`);
    const start = performance.now();

    let categories = [];
    if (!("SKIP_FETCHING_STORE_DATA" in process.env)) {
        categories = await crawlers[store].fetchCategories();
    }

    const mappingFile = `${dataDir}/${store}-categories.json`;
    let oldCategories = [];
    const oldLookup: Record<string, any> = {};
    if (fs.existsSync(mappingFile)) {
        oldCategories = await readJSONAsync(mappingFile);
        for (const category of oldCategories) {
            oldLookup[category.id] = category;
        }
    }

    for (const category of categories) {
        const oldCategory = oldLookup[category.id];
        if (oldCategory == null) {
            console.log(`Found new unmapped category for ${store}: ${category.id} - ${category.name}`);
        } else {
            category.code = oldCategory.code;
            delete oldLookup[category.id];
        }
    }

    if (Object.keys(oldLookup).length > 0) {
        for (const key in oldLookup) {
            const category = oldLookup[key];
            console.log(`Found category absent in latest mapping for ${store}: ${category.id} - ${category.name}`);
            categories.push(category);
        }
    }

    console.log(`Fetched ${store.toUpperCase()} categories, took ${(performance.now() - start) / 1000} seconds.`);
    writeJSON(mappingFile, categories, false);
}

async function currentProducts(dataDir: string, today: string, store: string) {
    console.log(`Started fetching data for ${store}`);
    const start = performance.now();
    try {
        const rawDataFile = `${dataDir}/${store}-${today}.json`;
        let rawItems;
        if ("SKIP_FETCHING_STORE_DATA" in process.env && fs.existsSync(rawDataFile + "." + FILE_COMPRESSOR))
            rawItems = await readJSONAsync(rawDataFile + "." + FILE_COMPRESSOR);
        else {
            rawItems = await crawlers[store].fetchData();
            writeJSON(rawDataFile, rawItems, true);
        }
        const items = dedupItems(getCanonicalFor(store, rawItems, today));

        let numUncategorized = 0;
        for (let i = 0; i < items.length; i++) {
            const rawItem = rawItems[i];
            const item = items[i];
            item.category = crawlers[store].getCategory(rawItem);
            if (item.category == null) numUncategorized++;
        }

        console.log(
            `Fetched ${store.toUpperCase()} data, took ${(performance.now() - start) / 1000} seconds, ${numUncategorized}/${
                items.length
            } items without category.`
        );
        return items;
    } catch (e) {
        console.error(`Error while fetching data from ${store}, continuing after ${(performance.now() - start) / 1000} seconds...`, e);
        return [];
    }
}

export async function updateData(dataDir: string, done: (items: Item[]) => void = () => {}) {
    const today = currentDate();
    console.log("Fetching data for date: " + today);
    const storeFetchPromises: Promise<Item[]>[] = [];
    for (const store of STORE_KEYS) {
        updateCategories(dataDir, store);

        storeFetchPromises.push(
            new Promise(async (resolve) => {
                resolve(currentProducts(dataDir, today, store));
            })
        );
    }

    let items = new Array<Item>().concat(...(await Promise.all(storeFetchPromises)));

    if (fs.existsSync(`${dataDir}/latest-canonical.json.${FILE_COMPRESSOR}`)) {
        const oldItems = readJSON(`${dataDir}/latest-canonical.json.${FILE_COMPRESSOR}`);
        mergePriceHistory(oldItems, items);
        console.log("Merged price history");
    }

    sortItems(items);
    items = dedupItems(items);
    writeJSON(`${dataDir}/latest-canonical.json`, items, true);

    //pg.insertData(items);

    if (done) done(items);
    return items;
}

export function dedupItems(items: Item[]) {
    const lookup: Record<string, Item> = {};
    const dedupItems: Item[] = [];
    let duplicates: Record<string, number> = {};
    for (const item of items) {
        const seenItem = lookup[item.uniqueId];
        if (!seenItem) {
            lookup[item.uniqueId] = item;
            dedupItems.push(item);
        } else {
            duplicates[item.store] = duplicates[item.store] ? duplicates[item.store] + 1 : 1;
        }
    }
    return dedupItems;
}

/// Given a directory of raw data of the form `$store-$date.json`, constructs
/// a canonical list of all products and their historical price data.
/// FIXME this is possibly broken
export async function replay(rawDataDir: string) {
    const today = currentDate();

    const files = fs
        .readdirSync(rawDataDir)
        .filter((file) => file.indexOf("canonical") == -1 && STORE_KEYS.some((store) => file.indexOf(`${store}-`) == 0));

    const dateSort = (a: string, b: string) => {
        const dateA = new Date(a.match(/\d{4}-\d{2}-\d{2}/)![0]);
        const dateB = new Date(b.match(/\d{4}-\d{2}-\d{2}/)![0]);
        return dateA.getTime() - dateB.getTime();
    };

    const getFilteredFilesFor = (store: string) =>
        files
            .filter((file) => file.indexOf(`${store}-`) == 0)
            .sort(dateSort)
            .map((file) => rawDataDir + "/" + file);

    const storeFiles: Record<string, string[]> = {};
    const canonicalFiles: Record<string, Item[][]> = {};

    for (const store of STORE_KEYS) {
        storeFiles[store] = getFilteredFilesFor(store);
        canonicalFiles[store] = storeFiles[store].map(function (file: string): Item[] {
            console.log(`Creating canonical items for ${file}`);
            const rawItems = readJSON(file);
            const items = dedupItems(getCanonicalFor(store, rawItems, file.match(/\d{4}-\d{2}-\d{2}/)![0]));
            for (let i = 0; i < items.length; i++) {
                const rawItem = rawItems[i];
                const item = items[i];
                item.category = crawlers[store].getCategory(rawItem);
            }
            return items;
        });
        canonicalFiles[store].reverse();
    }

    const allFilesCanonical = [];
    const len = Math.max(...Object.values(canonicalFiles).map((filesByStore) => filesByStore.length));
    for (let i = 0; i < len; i++) {
        const canonical: Item[] = [];
        Object.values(canonicalFiles).forEach((filesByStore) => {
            const file = filesByStore.pop();
            if (file) canonical.push(...file);
        });
        allFilesCanonical.push(canonical);
    }

    if (allFilesCanonical.length == 0) return null;
    if (allFilesCanonical.length == 1) return allFilesCanonical[0];

    let prev = allFilesCanonical[0];
    let curr = null;
    for (let i = 1; i < allFilesCanonical.length; i++) {
        curr = allFilesCanonical[i];
        console.log(`Merging ${i}/${allFilesCanonical.length} canonical files.`);
        mergePriceHistory(prev, curr);
        prev = curr;
    }
    return curr;
}
