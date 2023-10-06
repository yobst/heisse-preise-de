import { Item } from "../../common/models";

const { stem, stopWords } = require("./stem");

export function dotProduct(vector1: Record<string, number>, vector2: Record<string, number>) {
    let product = 0;
    for (const key in vector1) {
        if (vector2.hasOwnProperty(key)) {
            product += vector1[key] * vector2[key];
        }
    }
    return product;
}

export function addVector(vector1: Record<string, number>, vector2: Record<string, number>) {
    for (const key in vector2) {
        vector1[key] = (vector1[key] || 0) + vector2[key];
    }
}

export function scaleVector(vector: Record<string, number>, scalar: number) {
    for (const key in vector) {
        vector[key] *= scalar;
    }
}

export function normalizeVector(vector: Record<string, number>) {
    const len = magnitude(vector);
    for (const key in vector) {
        vector[key] /= len;
    }
}

export function magnitude(vector: Record<string, number>) {
    let sumOfSquares = 0;
    for (const key in vector) {
        sumOfSquares += vector[key] ** 2;
    }
    return Math.sqrt(sumOfSquares);
}

export function findMostSimilarItem(refItem: Item, items: Item[]) {
    let maxSimilarity = -1;
    let similarItem = null;
    let similarItemIdx = -1;
    for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        if (item.sorted) continue;
        let similarity = dotProduct(refItem.vector ?? {}, item.vector ?? {});
        if (similarity > maxSimilarity || similarity > 0.9999999) {
            maxSimilarity = similarity;
            similarItem = item;
            similarItemIdx = idx;
        }
        if (similarity > 0.9999999) {
            break;
        }
    }
    return {
        similarity: maxSimilarity,
        item: similarItem,
        index: similarItemIdx,
    };
}

export function findMostSimilarItems(refItem: Item, items: Item[], k = 5, accept = (ref: Item, item: Item) => true) {
    let topSimilarItems: Item[] = [];
    let topSimilarities: number[] = [];

    items.forEach((item, idx) => {
        if (!accept(refItem, item)) return;
        let similarity = dotProduct(refItem.vector ?? {}, item.vector ?? {});

        if (topSimilarItems.length < k) {
            topSimilarItems.push(item);
            topSimilarities.push(similarity);
        } else {
            let minSimilarity = Math.min(...topSimilarities);
            let minIndex = topSimilarities.indexOf(minSimilarity);

            if (similarity > minSimilarity) {
                topSimilarItems[minIndex] = item;
                topSimilarities[minIndex] = similarity;
            }
        }
    });

    let similarItemsWithIndices = topSimilarItems.map((item, index) => {
        return {
            similarity: topSimilarities[index],
            item: item,
            index: items.indexOf(item),
        };
    });

    return similarItemsWithIndices;
}

export function similaritySortItems(items: Item[]) {
    if (items.length == 0) return items;
    const sortedItems = [items.shift()];
    let refItem: Item | null = sortedItems[0]!;
    items.forEach((item) => (item.sorted = false));
    while (items.length != sortedItems.length) {
        const similarItem = findMostSimilarItem(refItem!, items);
        sortedItems.push(similarItem.item!);
        similarItem.item!.sorted = true;
        refItem = similarItem.item;
    }
    items.forEach((item) => (item.sorted = false));
    return sortedItems as Item[];
}

const NGRAM = 4;
export function vectorizeTokens(tokens: string[]) {
    const vector: Record<string, number> = {};
    for (const token of tokens) {
        if (token.length > NGRAM) {
            for (let i = 0; i < token.length - NGRAM; i++) {
                let trigram = token.substring(i, i + NGRAM);
                vector[trigram] = (vector[trigram] || 0) + 1;
            }
        } else {
            vector[token] = (vector[token] || 0) + 1;
        }
    }
    normalizeVector(vector);
    return vector;
}

export function vectorizeItem(item: Item, useUnit = true, useStem = true) {
    const isNumber = /^\d+\.\d+$/;
    let name = item.name
        .toLowerCase()
        .replace(/[^\w\s]|_/g, "")
        .replace("-", " ")
        .replace(",", " ");
    item.tokens = name
        .split(/\s+/)
        .filter((token) => !stopWords.includes(token))
        .filter((token) => !isNumber.test(token))
        .map((token) => (useStem ? stem(token) : token));
    if (useUnit) {
        if (item.quantity) item.tokens.push("" + item.quantity);
        if (item.unit) item.tokens.push(item.unit);
    }
    item.vector = vectorizeTokens(item.tokens);
}

export function vectorizeItems(items: Item[], useUnit = true) {
    items.forEach((item) => {
        if (!item.vector) vectorizeItem(item, useUnit);
    });
}
