import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { i18n } from "../utils/i18n";
import { globalStyles } from "../styles";

@customElement("hp-header")
export class Header extends LitElement {
    static styles = [globalStyles];

    protected render() {
        return html`
            <div class="lg:rounded-t-xl p-2 bg-primary text-2xl text-white text-center font-bold uppercase">🔥 ${i18n("Hot Prices")} 🔥</div>
        `;
    }
}
