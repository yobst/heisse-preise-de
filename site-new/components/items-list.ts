import { LitElement, html, nothing, render } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { globalStyles } from "../styles";
import { i18n } from "../i18n";
import { Item } from "../model/models";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { stores } from "../model/stores";
import { dom, downloadFile, downloadJSON, itemsToCSV, onVisibleOnce } from "../utils";
import { similaritySortItems, vectorizeItems } from "../knn";
import "./checkbox";

@customElement("hp-items-list")
export class ItemsList extends LitElement {
    static styles = [globalStyles];

    @property()
    items?: Item[];

    @property()
    highlights: string[] = [];

    @query("#salesPrice")
    salesPriceElement?: HTMLInputElement;

    @query("#sortType")
    sortTypeElement?: HTMLSelectElement;

    tableBody?: HTMLElement;

    protected render() {
        if (!this.items || this.items.length == 0) return nothing;
        this.tableBody = dom(html`<table class="w-full max-w-[100%]">
            <thead class="bg-primary text-white border border-primary">
                <th class="text-center uppercase">${i18n("Store")}</th>
                <th class="uppercase">${i18n("Name")}</th>
                <th class="text-left pl-2 uppercase">${i18n("Price")}</th>
                <th></th>
            </thead>
            <tbody id="table"></tbody>
        </table>`)[0];

        const result = html` <div class="flex flex-col w-full max-w-[1024px] mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center bg-[#E7E5E4] rounded-t-xl border p-2 text-sm gap-2">
                <div class="flex flex-col md:flex-row gap-2 items-center">
                    <div class="flex gap-2">
                        <div>${this.items.length} ${i18n("Results")}</div>
                        <span class="text-primary font-bold cursor-pointer" @click=${() => this.download("JSON")}>JSON</span>
                        <span class="text-primary font-bold cursor-pointer" @click=${() => this.download("CSV")}>CSV</span>
                    </div>
                    <hp-checkbox>${i18n("Chart")}</hp-checkbox>
                    <div>
                        <label
                            ><input type="radio" id="salesPrice" name="priceType" checked @change=${() => this.requestUpdate()} /> ${i18n(
                                "Sales price"
                            )}</label
                        >
                        <label
                            ><input type="radio" id="unitPrice" name="priceType" @change=${() => this.requestUpdate()} /> ${i18n("Unit price")}</label
                        >
                    </div>
                </div>
                <label
                    >${i18n("Sort by")}
                    <select id="sortType" @change=${() => this.requestUpdate()}>
                        <option value="price-asc">${i18n("Price ascending")}</option>
                        <option value="price-desc">${i18n("Price descending")}</option>
                        <option value="quantity-asc">${i18n("Quantity ascending")}</option>
                        <option value="quantity-desc">${i18n("Quantity descending")}</option>
                        <option value="store-and-name">${i18n("Store & name")}</option>
                        <option value="similarity" ${this.items.length > 500 ? "disabled" : ""}>${i18n("Name similarity")}</option>
                    </select>
                </label>
            </div>
            ${this.tableBody}
        </div>`;

        sort(this.items, (this.sortTypeElement?.value as any) ?? "price-asc", this.salesPriceElement?.checked ?? true);
        renderItems(this.items, 0, this.highlights, this.salesPriceElement?.checked ?? true, this.tableBody);

        return result;
    }

    download(type: "CSV" | "JSON") {
        if (!this.items) return;
        const cleanedItems: any[] = [];
        this.items.forEach((item) => {
            cleanedItems.push({
                store: item.store,
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                priceHistory: item.priceHistory,
                isWeighted: item.isWeighted,
                unit: item.unit,
                quantity: item.quantity,
                organic: item.organic,
                available: !(item.unavailable ?? false),
                url: stores[item.store].getUrl(item),
            });
        });
        if (type == "JSON") {
            downloadJSON("items.json", cleanedItems);
        } else {
            downloadFile("items.csv", itemsToCSV(cleanedItems));
        }
    }
}

function renderItems(items: Item[], startIndex: number, highlights: string[], salesPrice: boolean, table: HTMLElement) {
    if (startIndex >= items.length) return;
    const itemSubset = items.slice(startIndex, startIndex + 25);
    const itemDoms = itemSubset.map((item) => itemPartial(item, highlights, salesPrice));
    for (const itemDom of itemDoms) {
        table.appendChild(itemDom);
    }
    const lastDom = itemDoms[itemDoms.length - 1];
    onVisibleOnce(lastDom, () => {
        renderItems(items, startIndex + itemDoms.length, highlights, salesPrice, table);
    });
}

function itemPartial(item: Item, highlights: string[], salesPrice: boolean) {
    const store = stores[item.store];

    let quantity = item.quantity || "";
    let unit = item.unit || "";
    if (typeof quantity != "string" && quantity >= 1000 && (unit === "g" || unit === "ml")) {
        quantity = parseFloat((0.001 * quantity).toFixed(2));
        unit = unit == "ml" ? "l" : "kg";
    }

    let percentageChange: string | number = "";
    let price = item.priceHistory[0].price;
    let prevPrice = item.priceHistory[1] ? item.priceHistory[1].price : -1;
    if (prevPrice != -1) {
        percentageChange = Math.round(((price - prevPrice) / prevPrice) * 100);
    }

    let priceUnit = "";
    if (!salesPrice) {
        if (item.unit == "g") priceUnit = "kg";
        else if (item.unit == "ml") priceUnit = "l";
        else priceUnit = "stk";
    }

    return dom(html`<tr class="border color-${store.color}">
        <td class="text-center">${store.name}</td>
        <td class="py-0 h-[0px] align-top">
            <div class="flex px-2 py-1 h-full bg-white">
                <a href="${store.getUrl(item)}" target="_blank" class="hover:underline">${unsafeHTML(highlightMatches(highlights, item.name))}</a
                ><span class="text-xs ml-auto pl-2" style="white-space: nowrap;">${(item.isWeighted ? "⚖ " : "") + quantity + " " + unit}</span>
            </div>
        </td>
        <td class="text-left pl-2 cursor-pointer">
            ${i18n("currency symbol")} ${salesPrice ? item.price.toFixed(2) : item.unitPrice.toFixed(2) + " / " + priceUnit}
            ${typeof percentageChange != "string"
                ? html`<span style="color: ${percentageChange > 0 ? "red" : "green"}">${percentageChange > 0 ? "+" : ""}${percentageChange}%</span>`
                : nothing}
            ${item.priceHistory.length > 1 ? `(${item.priceHistory.length - 1})` : ""}
        </td>
        <td></td>
    </tr>`)[0];
}

function highlightMatches(keywords: string[], name: string) {
    let highlightedName = name;
    for (let i = 0; i < keywords.length; i++) {
        const string = keywords[i];
        // check if keyword is not preceded by a < or </
        const regex = new RegExp(string, "gi");
        highlightedName = highlightedName.replace(regex, "<strong>$&</strong>");
    }
    return highlightedName;
}

function sort(
    items: Item[],
    sortType: "price-asc" | "price-desc" | "quantity-asc" | "quantity-desc" | "store-and-name" | "similar",
    salesPrice: boolean
) {
    if (sortType == "price-asc") {
        if (salesPrice) items.sort((a, b) => a.price - b.price);
        else items.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sortType == "price-desc") {
        if (salesPrice) items.sort((a, b) => b.price - a.price);
        else items.sort((a, b) => b.unitPrice - a.unitPrice);
    } else if (sortType == "quantity-asc") {
        items.sort((a, b) => {
            if (a.unit != b.unit) return (a.unit as any).localeCompare(b.unit);
            return a.quantity - b.quantity;
        });
    } else if (sortType == "quantity-desc") {
        items.sort((a, b) => {
            if (a.unit != b.unit) return (a.unit as any).localeCompare(b.unit);
            return b.quantity - a.quantity;
        });
    } else if (sortType == "store-and-name") {
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
    } else {
        vectorizeItems(items);
        items = similaritySortItems(items);
    }
    return items;
}
