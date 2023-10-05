import { LitElement, PropertyValueMap, html, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "../components";
import { i18n } from "../i18n";
import { loadItems } from "../model/items";
import { globalStyles } from "../styles";
import { Item } from "../model/models";
import { ItemsFilter, ItemsFilterState, ItemsList, ItemsListState, ProgressBar } from "../components";
import { copyCurrentURLToClipboard, getQueryParam, setQueryParam } from "../utils";

@customElement("hp-search-page")
export class SearchPage extends LitElement {
    static styles = [globalStyles];

    @query("#progress-bar")
    progressBar?: ProgressBar;

    @query("#itemsFilter")
    itemsFilter?: ItemsFilter;

    @query("#itemsList")
    itemsList?: ItemsList;

    @state()
    items?: Item[];

    @state()
    lookup?: Record<string, Item>;

    @state()
    filteredItems?: Item[];

    @state()
    linkCopied = false;

    queryTokens: string[] = [];

    async load() {
        const { items, lookup } = await loadItems((progress) => {
            if (this.progressBar) {
                this.progressBar.value = progress;
                if (progress >= 100) {
                    this.progressBar.classList.add("hidden");
                }
            }
        });
        this.items = items;
        this.lookup = lookup;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.load();
    }

    restoredState = false;

    protected render(): unknown {
        return html`
            <main>
                <hp-header></hp-header>
                <hp-menu class="mt-[-1em]"></hp-menu>
                <h1 class="text-center text-2xl font-bold">${i18n("Product Search")}</h1>
                ${!this.items
                    ? html`<div class="flex flex-1 justify-center">
                          <hp-progress-bar id="progress-bar" value="2"></hp-progress-bar>
                      </div>`
                    : nothing}
                ${this.items && this.lookup
                    ? html` <a class="text-center text-xl font-bold cursor-pointer text-primary" @click=${() => this.shareLink()}
                              >${i18n("Share link")} ${this.linkCopied ? html`<span id="copied">${i18n("(Copied)")}</span>` : ""}</a
                          >
                          <hp-items-filter
                              id="itemsFilter"
                              class="w-full flex flex-col items-center"
                              .itemsChanged=${this.filter.bind(this)}
                              .items=${this.items}
                              .lookup=${this.lookup}
                              .stateChanged=${() => this.stateChanged()}
                          ></hp-items-filter>`
                    : nothing}
                ${this.filteredItems
                    ? html`<hp-items-list
                          id="itemsList"
                          class="w-full"
                          .items=${this.filteredItems}
                          .lookup=${this.lookup}
                          .highlights=${this.queryTokens}
                          .stateChanged=${() => this.stateChanged()}
                      ></hp-items-list>`
                    : nothing}
                <div class="flex-1"></div>
                <hp-footer></hp-footer>
            </main>
        `;
    }

    filter(items: Item[], queryTokens?: string[]) {
        this.filteredItems = [...items];
        this.queryTokens = queryTokens ?? [];
        this.requestUpdate();
    }

    shareLink() {
        const filterState = this.itemsFilter?.getState();
        const listState = this.itemsList?.getState();
        setQueryParam("itemsFilter", JSON.stringify(filterState));
        setQueryParam("itemsList", JSON.stringify(listState));
        copyCurrentURLToClipboard();
        this.linkCopied = true;
        this.requestUpdate();
    }

    stateChanged() {
        this.linkCopied = false;
    }
}
