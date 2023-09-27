import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { globalStyles } from "../styles";

@customElement("hp-progress-bar")
export class ProgressBar extends LitElement {
    static styles = [globalStyles];

    @property()
    value = 0;

    protected render() {
        if (this.value == 0) return nothing;

        return html`
            <div class="border rounded-lg min-h-[8px] min-w-[300px]">
                <div class="bg-primary border border-primary min-h-[8px] rounded-lg" style="width: ${this.value}%;"></div>
            </div>
        `;
    }
}
