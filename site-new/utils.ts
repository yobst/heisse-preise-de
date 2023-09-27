import { TemplateResult, render } from "lit-html";
import { Item } from "./model/models";
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
