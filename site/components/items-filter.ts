import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit-html/directives/map.js";
import { globalStyles } from "../styles";
import { i18n } from "../utils/i18n";
import { Item, Price, units } from "../../common/models";
import { BUDGET_BRANDS, STORE_KEYS, stores } from "../../common/stores";
import alasql from "alasql";
import { Checkbox } from "./checkbox";
import { StatefulElement, getQueryParam } from "../utils/utils";

const getNumber = (value: string, def: number) => {
    try {
        return Number.parseFloat(value);
    } catch (e) {
        return def;
    }
};

export class ItemsFilterState {
    constructor(
        public readonly query: string,
        public readonly selectedStores: string[],
        public readonly minPrice: number,
        public readonly maxPrice: number,
        public readonly discountBrandsOnly: boolean,
        public readonly organicOnly: boolean
    ) {}
}

@customElement("hp-items-filter")
export class ItemsFilter extends LitElement implements StatefulElement<ItemsFilterState> {
    static styles = [globalStyles];

    @property()
    items: Item[] = [];

    @property()
    lookup: Record<string, Item> = {};

    @property()
    itemsChanged: (filteredItems: Item[], queryTokens: string[]) => void = () => {};

    @property()
    stateChanged: (state: ItemsFilterState) => void = () => {};

    @query("#query")
    queryElement?: HTMLInputElement;

    @query("#storeCheckboxes")
    storeCheckboxes?: HTMLDivElement;

    @query("#allStores")
    allStoresElement?: Checkbox;

    @query("#minPrice")
    minPriceElement?: HTMLInputElement;

    @query("#maxPrice")
    maxPriceElement?: HTMLInputElement;

    @query("#discountBrandsOnly")
    discountBrandsOnlyElement?: Checkbox;

    @query("#organicOnly")
    organicOnlyElement?: Checkbox;

    @state()
    isAlaSQLQuery = false;

    @state()
    sqlError = "";

    selectedStores = [...STORE_KEYS];

    restoredState = false;

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (this.items.length > 0 && !this.restoredState) {
            this.restoredState = true;
            const stateString = getQueryParam(this.id);
            if (stateString) {
                const state = JSON.parse(stateString) as ItemsFilterState;
                this.setState(state);
            }
        }
    }

    getState() {
        return new ItemsFilterState(
            this.queryElement?.value ?? "",
            this.selectedStores,
            this.minPriceElement ? getNumber(this.minPriceElement.value, 0) : 0,
            this.maxPriceElement ? getNumber(this.maxPriceElement.value, 1000) : 1000,
            this.discountBrandsOnlyElement?.checked ?? false,
            this.organicOnlyElement?.checked ?? false
        );
    }

    setState(state: ItemsFilterState) {
        this.queryElement!.value = state.query;
        this.selectedStores = state.selectedStores;
        this.minPriceElement!.value = state.minPrice.toString();
        this.maxPriceElement!.value = state.maxPrice.toString();
        this.discountBrandsOnlyElement!.checked = state.discountBrandsOnly;
        this.organicOnlyElement!.checked = state.organicOnly;
        this.filter();
    }

    protected render() {
        return html`
            <div class="bg-[#E7E5E4] rounded-xl border p-4 flex flex-col gap-2 w-full max-w-[800px]">
                <input @input="${this.filter}" id="query" class="w-full rounded-full px-4 py-1" placeholder="${i18n("search placeholder")}" />
                ${!this.isAlaSQLQuery
                    ? html` <div id="storeCheckboxes" class="flex justify-center gap-2 flex-wrap text-xs">
                              <hp-checkbox id="allStores" @change="${() => this.toggleAllStores()}" checked="true">${i18n("All")}</hp-checkbox>
                              ${map(
                                  STORE_KEYS,
                                  (store) =>
                                      html`<hp-checkbox @change="${() => this.toggleStore(store)}" bgColor="${stores[store].color}" checked="true"
                                          >${stores[store].displayName}</hp-checkbox
                                      >`
                              )}
                          </div>
                          <div class="flex justify-center gap-2 flex-wrap text-xs">
                              <hp-checkbox id="discountBrandsOnly" @change="${this.filter}">${i18n("Discount store brands only")}</hp-checkbox>
                              <hp-checkbox id="organicOnly" @change="${this.filter}">${i18n("Organic only")}</hp-checkbox>
                              <div class="rounded-full border bg-white px-2 py-1 flex-wrap">
                                  <span>${i18n("Price") + " " + i18n("currency symbol")}</span>
                                  <input @input="${this.filter}" class="text-center" id="minPrice" type="number" min="0" max="10000" value="0" />
                                  <span>-</span>
                                  <input @input="${this.filter}" class="text-center" id="maxPrice" type="number" min="0" max="10000" value="100" />
                              </div>
                          </div>`
                    : this.sqlError
                    ? html`<div>${this.sqlError}</div>`
                    : nothing}
            </div>
        `;
    }

    toggleAllStores() {
        const storeCheckboxes = Array.from(this.storeCheckboxes!.querySelectorAll("hp-checkbox")).filter(
            (checkbox) => checkbox != this.allStoresElement
        ) as Checkbox[];
        storeCheckboxes.forEach((checkbox) => {
            checkbox.checked = this.allStoresElement!.checked;
        });
        this.selectedStores = this.allStoresElement!.checked ? [...STORE_KEYS] : [];
        this.filter();
    }

    toggleStore(store: string) {
        if (this.selectedStores.includes(store)) {
            this.selectedStores = this.selectedStores.filter((other) => other != store);
        } else {
            this.selectedStores = [...this.selectedStores, store];
        }
        this.filter();
    }

    filter() {
        const query = this.queryElement?.value.trim() ?? "";
        if (query.startsWith("!")) {
            this.isAlaSQLQuery = true;
            this.sqlError = "";
            try {
                const hits = this.queryItemsAlasql(query, this.items);
                this.itemsChanged(hits, []);
            } catch (e) {
                if (e instanceof Error) this.sqlError = e.message;
                else this.sqlError = "Unknown alaSQL error";
                this.itemsChanged([], []);
            }
        } else {
            const minPrice = this.minPriceElement ? getNumber(this.minPriceElement.value, 0) : 0;
            const maxPrice = this.maxPriceElement ? getNumber(this.maxPriceElement.value, 1000) : 1000;
            const organicOnly = this.organicOnlyElement?.checked ?? false;
            const discountBrandsOnly = this.discountBrandsOnlyElement?.checked ?? false;
            const selectedStores = this.selectedStores;

            const filteredItems = this.items.filter((item) => {
                if (!selectedStores.includes(item.store)) return;
                if (discountBrandsOnly && !BUDGET_BRANDS.some((budgetBrand) => item.name.toLowerCase().indexOf(budgetBrand) >= 0)) return false;
                if (organicOnly && !item.isOrganic) return false;
                if (minPrice > item.price) return false;
                if (maxPrice < item.price) return false;
                return true;
            });

            this.isAlaSQLQuery = false;
            const hits = this.queryItems(query, filteredItems, false);
            this.itemsChanged(hits.items, hits.queryTokens);
        }
        this.stateChanged(this.getState());
    }

    queryItemsAlasql(query: string, items: Item[]): Item[] {
        alasql.fn.hasPriceChange = (priceHistory: Price[], date: string, endDate: string) => {
            if (!endDate) return priceHistory.some((price) => price.date == date);
            else return priceHistory.some((price) => price.date >= date && price.date <= endDate);
        };

        alasql.fn.hasPriceChangeLike = (priceHistory: Price[], date: string) => {
            return priceHistory.some((price) => price.date.indexOf(date) >= 0);
        };

        alasql.fn.daysBetween = (date1: string, date2: string) => {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diffInMs = Math.abs((d2 as any) - (d1 as any));
            const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
            return days;
        };

        alasql.fn.priceOn = function (priceHistory: Price[], date: string) {
            return this.priceOn(priceHistory, date);
        };

        alasql.fn.unitPriceOn = function (priceHistory: Price[], date: string) {
            return this.unitPriceOn(priceHistory, date);
        };

        alasql.fn.percentageChangeSince = function (priceHistory: Price[], date: string) {
            const firstPrice = this.priceOn(priceHistory, date);
            const price = priceHistory[0].price;
            return ((price - firstPrice) / firstPrice) * 100;
        };

        query = query.substring(1);
        const result = alasql("SELECT CONCAT(`store`, id) AS sid FROM ? WHERE " + query, [items]) as { sid: string }[];
        return result.map((row) => this.lookup[row.sid]);
    }

    queryItems(query: string, items: Item[], exactWord = false): { items: Item[]; queryTokens: string[] } {
        query = query.trim().replace(",", ".").toLowerCase();
        if (query.length < 3) return { items: [], queryTokens: [] };
        const regex = /([\p{L}&-\.][\p{L}\p{N}&-\.]*)|(>=|<=|=|>|<)|(\d+(\.\d+)?)/gu;
        let tokens: string[] | null = query.match(regex);
        if (!tokens) return { items: [], queryTokens: [] };

        // Find quantity/unit query
        let newTokens = [];
        let unitQueries = [];
        const operators = ["<", "<=", ">", ">=", "="];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let unit = units[token];
            if (unit && i > 0 && /^\d+(\.\d+)?$/.test(tokens[i - 1])) {
                newTokens.pop();
                let operator = "=";
                if (i > 1 && operators.includes(tokens[i - 2])) {
                    newTokens.pop();
                    operator = tokens[i - 2];
                }

                unitQueries.push({
                    operator,
                    quantity: Number.parseFloat(tokens[i - 1]) * unit.factor,
                    unit: unit.unit,
                });
            } else {
                newTokens.push(token);
            }
        }
        tokens = newTokens;
        if (!tokens || tokens.length == 0) return { items: [], queryTokens: [] };

        let hits = [];
        for (const item of items) {
            let allFound = true;
            for (let token of tokens) {
                if (token.length === 0) continue;
                let not = false;
                if (token.startsWith("-") && token.length > 1) {
                    not = true;
                    token = token.substring(1);
                }
                const index = item.search.indexOf(token);
                if ((!not && index < 0) || (not && index >= 0)) {
                    allFound = false;
                    break;
                }
                if (exactWord) {
                    if (index > 0 && item.search.charAt(index - 1) != " " && item.search.charAt(index - 1) != "-") {
                        allFound = false;
                        break;
                    }
                    if (index + token.length < item.search.length && item.search.charAt(index + token.length) != " ") {
                        allFound = false;
                        break;
                    }
                }
            }
            if (allFound) {
                let allUnitsMatched = true;
                for (const query of unitQueries) {
                    if (query.unit != item.unit) {
                        allUnitsMatched = false;
                        break;
                    }

                    if (query.operator == "=" && !(item.quantity == query.quantity)) {
                        allUnitsMatched = false;
                        break;
                    }

                    if (query.operator == "<" && !(item.quantity < query.quantity)) {
                        allUnitsMatched = false;
                        break;
                    }

                    if (query.operator == "<=" && !(item.quantity <= query.quantity)) {
                        allUnitsMatched = false;
                        break;
                    }

                    if (query.operator == ">" && !(item.quantity > query.quantity)) {
                        allUnitsMatched = false;
                        break;
                    }

                    if (query.operator == ">=" && !(item.quantity >= query.quantity)) {
                        allUnitsMatched = false;
                        break;
                    }
                }
                if (allUnitsMatched) hits.push(item);
            }
        }
        return { items: hits, queryTokens: tokens.filter((token) => !token.startsWith("-")) };
    }
}
