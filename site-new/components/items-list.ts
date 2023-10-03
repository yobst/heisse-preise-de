import { LitElement, PropertyValueMap, html, nothing, render } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit-html/directives/map.js";
import { globalStyles } from "../styles";
import { i18n } from "../i18n";
import { Item } from "../model/models";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { stores } from "../model/stores";
import { dom, downloadFile, downloadJSON, itemsToCSV, onVisibleOnce } from "../utils";
import { similaritySortItems, vectorizeItems } from "../knn";
import "./checkbox";
import { ItemsChart } from "./chart";
import { Checkbox, IconCheckbox } from "./checkbox";

@customElement("hp-items-list")
export class ItemsList extends LitElement {
    static styles = [globalStyles];

    @property()
    enableItemChart = true;

    @property()
    items: Item[] = [];

    @property()
    highlights: string[] = [];

    @query("#salesPrice")
    salesPriceElement?: HTMLInputElement;

    @query("#sortType")
    sortTypeElement?: HTMLSelectElement;

    @query("#chevron")
    chevronElement?: HTMLSpanElement;

    @query("#chart")
    itemsChart?: ItemsChart;

    @query("#showChart")
    showChart?: Checkbox;

    tableBody?: HTMLElement;

    pricesExpanded = false;

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (_changedProperties.has("items")) {
            this.itemsChart!.items = [...this.items];
        }
    }

    protected render() {
        this.pricesExpanded = false;
        if (this.items.length == 0) return nothing;
        this.tableBody = dom(html`<table class="w-full max-w-[100%]">
            <thead class="bg-primary text-white border border-primary">
                <th class="text-center uppercase">${i18n("Store")}</th>
                <th class="uppercase">${i18n("Name")}</th>
                <th class="text-left pl-2 uppercase cursor-pointer" @click=${() => this.togglePriceHistories()}>
                    ${i18n("Price")} <span id="chevron">${this.pricesExpanded ? "▲" : "▼"}</span>
                </th>
                <th></th>
            </thead>
            <tbody id="table"></tbody>
        </table>`)[0];

        const result = html` <div class="flex flex-col w-full max-w-[1024px] mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center bg-[#E7E5E4] rounded-t-xl border p-2 text-sm gap-2">
                <div class="flex flex-col md:flex-row gap-2 items-center">
                    <div class="flex items-center gap-2">
                        <div>${this.items.length} ${i18n("Results")}</div>
                        <span class="text-primary font-bold cursor-pointer" @click=${() => this.download("JSON")}>JSON</span>
                        <span class="text-primary font-bold cursor-pointer" @click=${() => this.download("CSV")}>CSV</span>
                        <hp-checkbox id="showChart" @change=${() => this.itemsChart?.classList.toggle("hidden")}>${i18n("Chart")}</hp-checkbox>
                    </div>
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
                        <option value="similarity" ?disabled=${this.items.length > 500}>${i18n("Name similarity")}</option>
                    </select>
                </label>
            </div>
            <hp-chart id="chart" class="hidden"> </hp-chart>
            ${this.tableBody}
        </div>`;

        this.sort(this.items, (this.sortTypeElement?.value as any) ?? "price-asc", this.salesPriceElement?.checked ?? true);
        this.renderItems(this.items, 0, this.highlights, this.salesPriceElement?.checked ?? true, this.tableBody);

        return result;
    }

    togglePriceHistories() {
        const chevron = this.chevronElement!;
        this.pricesExpanded = !this.pricesExpanded;
        chevron.innerText = this.pricesExpanded ? "▲" : "▼";
        const itemDoms = this.tableBody?.querySelectorAll("tr.border")!;
        for (const itemDom of Array.from(itemDoms)) {
            const chevron = itemDom.querySelector("#chevron") as HTMLElement;
            if (!chevron) continue;
            chevron.innerText = this.pricesExpanded ? "▲" : "▼";
            if (this.pricesExpanded) {
                itemDom.querySelector("#priceHistory")?.classList.remove("hidden");
            } else {
                itemDom.querySelector("#priceHistory")?.classList.add("hidden");
            }
        }
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
    renderItems(items: Item[], startIndex: number, highlights: string[], salesPrice: boolean, table: HTMLElement) {
        if (startIndex >= items.length) return;
        const itemSubset = items.slice(startIndex, startIndex + 25);
        const itemDoms = itemSubset.map((item) => this.itemPartial(item, highlights, salesPrice));
        for (const itemDom of itemDoms) {
            table.appendChild(itemDom);
        }
        const lastDom = itemDoms[itemDoms.length - 1];
        onVisibleOnce(lastDom, () => {
            this.renderItems(items, startIndex + itemDoms.length, highlights, salesPrice, table);
        });
    }

    itemPartial(item: Item, highlights: string[], salesPrice: boolean) {
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

        const showPriceHistory = (show: boolean) => {
            const chevron = itemDom.querySelector("#chevron") as HTMLElement;
            if (!chevron) return;
            chevron.innerText = show ? "▲" : "▼";
            if (show) {
                itemDom.querySelector("#priceHistory")?.classList.remove("hidden");
            } else {
                itemDom.querySelector("#priceHistory")?.classList.add("hidden");
            }
        };

        const togglePriceHistory = () => {
            const show = (itemDom.querySelector("#chevron") as HTMLElement)!.innerText != "▲";
            showPriceHistory(show);
        };

        const maxWidth = 190;
        const maxPrice = item.priceHistory.reduce((max, current) => (current.price > max.price ? current : max), item.priceHistory[0]);
        const priceChanges: { price: number; unitPrice: number; date: string; change: number; width: number }[] = item.priceHistory
            .reverse()
            .map((price, index) => {
                const width = Math.ceil((price.price / maxPrice.price) * 100);
                if (index == 0) return { ...price, change: 0, width };
                const lastPrice = item.priceHistory[index - 1].price;
                return { ...price, change: ((price.price - lastPrice) / lastPrice) * 100, width };
            })
            .reverse();

        const itemDom = dom(html`<tr class="border color-${store.color} max-w-[100%]">
        <td class="py-1 text-center uppercase font-medium align-top">${store.name}</td>
        <td class="py-0 h-[0px] align-top">
            <div class="flex flex-col px-2 py-1 h-full bg-white">
            <div class="flex whitespace-normal">
                <a href="${store.getUrl(item)}" target="_blank" class="hover:underline">${unsafeHTML(this.highlightMatches(highlights, item.name))}</a
                ><span class="text-xs ml-auto pl-2 my-auto" style="white-space: nowrap;">${
                    (item.isWeighted ? "⚖ " : "") + quantity + " " + unit
                }</span>
            </div>
            <div>
                <table id="priceHistory" class="hidden">
                    ${map(
                        priceChanges,
                        (priceChange) => html`
                        <tr class="text-xs">
                                <td>${priceChange.date}</td>
                                <td>
                                <div class="px-1 text-white ${priceChange.change <= 0 ? "green" : "red"}" style="width: ${priceChange.width}px;">
                                ${i18n("currency symbol")} ${priceChange.price}
                                </div>
                                </td>
                                ${
                                    priceChange.change != 0
                                        ? html`<td>${priceChange.change >= 0 ? "+" : ""}${priceChange.change.toFixed(0)}%</td>`
                                        : nothing
                                }
                            </div>
                        </tr>
                        `
                    )}
                </table>
            </div>
            <div>
        </td>
        <td class="py-1 text-left pl-2 cursor-pointer align-top" @click=${() => togglePriceHistory()}>
            ${i18n("currency symbol")} ${salesPrice ? item.price.toFixed(2) : item.unitPrice.toFixed(2) + " / " + priceUnit}
            ${
                typeof percentageChange != "string"
                    ? html`<span class="text-xs" style="color: ${percentageChange > 0 ? "red" : "green"}"
                          >${percentageChange > 0 ? "+" : ""}${percentageChange}%</span
                      >`
                    : nothing
            }
            ${
                item.priceHistory.length > 1
                    ? html`<span class="text-xs">(${item.priceHistory.length - 1})</span> <span id="chevron" class="text-xs">▼</span>`
                    : ""
            }
        </td>
        ${
            this.enableItemChart
                ? html`<td class="align-top">
                      <hp-icon-checkbox
                          @change=${(event: Event) => {
                              if (!this.showChart?.checked) {
                                  this.showChart!.checked = true;
                                  this.itemsChart?.classList.toggle("hidden");
                              }
                              item.chart = (event.target as IconCheckbox).checked;
                              this.itemsChart!.items = [...this.itemsChart!.items];
                          }}
                          >📈</hp-icon-checkbox
                      >
                  </td>`
                : html`<td></td>`
        }
    </tr>`)[0];
        return itemDom;
    }

    highlightMatches(keywords: string[], name: string) {
        let highlightedName = name;
        for (let i = 0; i < keywords.length; i++) {
            const string = keywords[i];
            // check if keyword is not preceded by a < or </
            const regex = new RegExp(string, "gi");
            highlightedName = highlightedName.replace(regex, "<strong>$&</strong>");
        }
        return highlightedName;
    }

    sort(items: Item[], sortType: "price-asc" | "price-desc" | "quantity-asc" | "quantity-desc" | "store-and-name" | "similar", salesPrice: boolean) {
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
}
