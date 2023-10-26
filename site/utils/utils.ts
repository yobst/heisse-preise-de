import { TemplateResult, render } from "lit-html";
import { Item, Price } from "../../common/models";
import { BUDGET_BRANDS, stores } from "../../common/stores";
import * as pako from "pako";

export function deltaTime(start: number) {
    return (performance.now() - start) / 1000;
}

export function log(message: string, trace = false) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    console.log(`${hours}:${minutes}:${seconds}: ${message}`);
    if (trace) console.trace("trace");
}

export function dom(template: TemplateResult, container?: HTMLElement | DocumentFragment): HTMLElement[] {
    if (container) {
        render(template, container);
        return [];
    }

    const div = document.createElement(`div`);
    render(template, div);
    const children: Element[] = [];
    for (let i = 0; i < div.children.length; i++) {
        children.push(div.children[i]);
    }
    return children as HTMLElement[];
}

export function onVisibleOnce(target: HTMLElement, callback: () => void) {
    let isTargetVisible = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.target === target && entry.isIntersecting) {
                if (!isTargetVisible) {
                    isTargetVisible = true;
                    callback();
                }
                observer.unobserve(target);
            }
        });
    });
    observer.observe(target);
}

export function downloadJSON(filename: string, content: any) {
    downloadFile(filename, JSON.stringify(content, null, 2));
}

export function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
}

export function uniqueDates(items: Item[], startDate: string, endDate: string) {
    const allDates = items.flatMap((item) =>
        item.priceHistory.filter((price) => price.date >= startDate && price.date <= endDate).map((item) => item.date)
    );
    const uniqueDates = new Set(allDates);
    uniqueDates.add(startDate);
    uniqueDates.add(endDate);
    const uniqueDatesList = [...uniqueDates];
    uniqueDatesList.sort();
    return uniqueDatesList;
}

export function calculateItemPriceTimeSeries(
    item: Item,
    unitPrice: boolean,
    percentageChange: boolean,
    startDate: string,
    uniqueDates: string[]
): number[] {
    const getPrice = unitPrice ? (p: Price) => p.unitPrice : (p: Price) => p.price;

    const priceScratch = new Array<number | null>(uniqueDates.length);
    priceScratch.fill(null);
    const priceHistoryLookup = new Map<String, Price>();

    let startPrice: number | null = null;
    item.priceHistory.forEach((price) => {
        priceHistoryLookup.set(price.date, price);
        if (!startPrice && price.date <= startDate) {
            startPrice = getPrice(price);
        }
    });

    if (startPrice == null) {
        const firstPrice = item.priceHistory[item.priceHistory.length - 1];
        startPrice = getPrice(firstPrice);
    }
    for (let i = 0; i < uniqueDates.length; i++) {
        const priceObj = priceHistoryLookup.get(uniqueDates[i]);
        priceScratch[i] = priceObj ? getPrice(priceObj) : null;
    }

    for (let i = 0; i < priceScratch.length; i++) {
        if (priceScratch[i] == null) {
            priceScratch[i] = startPrice;
        } else {
            startPrice = priceScratch[i];
        }
    }

    if (priceScratch.some((price) => price == null)) {
        return [];
    }

    if (percentageChange) {
        const firstPrice = priceScratch.find((price) => price != 0);
        if (firstPrice == 0) return [];
        for (let i = 0; i < priceScratch.length; i++) {
            priceScratch[i] = ((priceScratch[i]! - firstPrice!) / firstPrice!) * 100;
        }
    }

    if (priceScratch.some((price) => isNaN(price!))) {
        return [];
    }
    return priceScratch as number[];
}

export function setQueryParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, "", url.toString());
}

export function getQueryParam(key: string): string | null {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}

export function copyCurrentURLToClipboard(): void {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}

export interface StatefulElement<T> {
    getState(): T;
    setState(state: T): void;
    stateChanged: (state: T) => void;
}
