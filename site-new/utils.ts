import { TemplateResult, render } from "lit-html";
import { Item, Price } from "./model/models";
import { BUDGET_BRANDS, stores } from "./model/stores";

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

export function itemsToCSV(items: Item[]) {
    let result = "store;id;name;priceDate;price;isBudgetBrand;quantity;unit;isWeighted;isOrganic;isAvailable;url\n";
    for (const item of items) {
        if (item.store == "lidl" || item.store == "penny") continue;
        let rowFront = "";
        rowFront += item.store + ";";
        rowFront += `"${item.id}"` + ";";
        rowFront += item.name.replace(";", " ") + ";";

        let rowBack = ";";
        rowBack += BUDGET_BRANDS.some((budgetBrand) => item.name.toLowerCase().indexOf(budgetBrand) >= 0) + ";";
        rowBack += item.quantity + ";";
        rowBack += item.unit + ";";
        rowBack += (item.isWeighted ?? false) + ";";
        rowBack += (item.organic ?? false) + ";";
        rowBack += !(item.unavailable ?? false) + ";";
        rowBack += stores[item.store].getUrl(item) + ";";

        for (const price of item.priceHistory) {
            result += rowFront + price.date + ";" + price.price + rowBack + "\n";
        }
    }
    return result;
}

export function today() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
