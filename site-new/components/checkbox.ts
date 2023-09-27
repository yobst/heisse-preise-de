import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { globalStyles } from "../styles";

@customElement("hp-checkbox")
export class Checkbox extends LitElement {
    static styles = [globalStyles];

    @property()
    checked = false;

    @property()
    bgColor: "red" | "yellow" | "green" | "purple" | "pink" | "rose" | "orange" | "blue" | "teal" | "stone" | "emerald" | "indigo" = "stone";

    render() {
        return html`
            <label
                class="p-1 px-2 flex gap-1 items-center rounded-xl border cursor-pointer hover:bg-gray-400 color-${this.bgColor}"
                @click="${this.toggleChecked}"
            >
                <div class="rounded-full border w-[0.5em] h-[0.5em] border-1 border-black ${this.checked ? "bg-black" : "bg-white"}"></div>
                <span><slot></slot></span>
            </label>
        `;
    }

    toggleChecked() {
        this.checked = !this.checked;
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
}
