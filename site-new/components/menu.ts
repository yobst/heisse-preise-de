import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "../styles";
import { i18n } from "../i18n";

@customElement("hp-menu")
export class Menu extends LitElement {
    static styles = [globalStyles];

    protected render() {
        return html`
            <div class="border border-primary/50 lg:rounded-b-xl p-2 flex justify-center gap-4 w-full overflow-auto">
                <a href="/index.html" class="text-primary font-bold">${i18n("Search")}</a>
                <a href="/changes.html" class="text-primary font-bold">${i18n("Price Changes")}</a>
                <a href="/carts.html" class="text-primary font-bold">${i18n("Carts")}</a>
            </div>
        `;
    }
}
