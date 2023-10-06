import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "../styles";
import { i18n } from "../utils/i18n";

@customElement("hp-footer")
export class Footer extends LitElement {
    static styles = [globalStyles];

    protected render() {
        return html` <div class="flex justify-center text-center text-sm">${i18n("footer-1")}<br />${i18n("footer-2")}</div> `;
    }
}
