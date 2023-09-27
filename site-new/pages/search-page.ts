import { LitElement, html, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import "../components";
import { i18n } from "../i18n";
import { loadItems } from "../model/items";
import { globalStyles } from "../styles";
import { Item } from "../model/models";
import { ProgressBar } from "../components";

@customElement("hp-search-page")
export class SearchPage extends LitElement {
    static styles = [globalStyles];

    @query("#progress-bar")
    progressBar?: ProgressBar;

    @state()
    items?: Item[];

    @state()
    lookup?: Record<string, Item>;

    @state()
    filteredItems?: Item[];

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
                    ? html`<hp-items-filter
                          class="w-full flex flex-col items-center"
                          .itemsChanged=${this.filter.bind(this)}
                          .items=${this.items}
                          .lookup=${this.lookup}
                      ></hp-items-filter>`
                    : nothing}
                ${this.filteredItems
                    ? html`<hp-items-list class="w-full" .items=${this.filteredItems} .highlights=${this.queryTokens}></hp-items-list>`
                    : nothing}
                <div class="flex-1"></div>
                <hp-footer></hp-footer>
            </main>
        `;
    }

    filter(items: Item[], queryTokens?: string[]) {
        this.filteredItems = [...items];
        this.queryTokens = queryTokens ?? [];
        console.log("Filtered items");
    }
}
