import { LitElement, PropertyValueMap, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { globalStyles } from "../styles";
import { Item, Price } from "../model/models";
import { i18n } from "../i18n";
import { calculateItemPriceTimeSeries, today, uniqueDates } from "../utils";
import { Checkbox } from "./checkbox";
import { STORE_KEYS } from "../model/stores";
const moment = require("moment");
const { Chart, registerables } = require("chart.js");
require("chartjs-adapter-moment");
Chart.register(...registerables);

@customElement("hp-chart")
export class ItemsChart extends LitElement {
    static styles = [globalStyles];

    @property()
    items: Item[] = [];

    @property()
    unitPrice = false;

    @query("#canvas")
    canvas?: HTMLCanvasElement;

    @query("#priceSum")
    priceSumCheckbox?: Checkbox;

    @query("#priceSumPerStore")
    priceSumPerStoreCheckbox?: Checkbox;

    @query("#todayOnly")
    todayOnlyCheckbox?: Checkbox;

    @query("#percentageChange")
    percentageChangeCheckbox?: Checkbox;

    @query("#startDate")
    startDateElement?: HTMLInputElement;

    @query("#endDate")
    endDateElement?: HTMLInputElement;

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        const items = this.items;
        const onlyToday = this.todayOnlyCheckbox!.checked;
        let startDate = this.startDateElement!.value;
        let endDate = this.endDateElement!.value;
        let validDate = /^20\d{2}-\d{2}-\d{2}$/;
        if (!validDate.test(startDate)) startDate = "2023-01-01";
        if (!validDate.test(endDate)) endDate = today();
        const percentageChange = this.percentageChangeCheckbox!.checked;
        const itemsToShow: { name: string; priceHistory: Price[] }[] = [];

        if (this.priceSumCheckbox!.checked && items.length > 0) {
            itemsToShow.push({
                name: i18n("Price sum"),
                priceHistory: calculateOverallPriceChanges(items, this.unitPrice, onlyToday, percentageChange, startDate, endDate),
            });
        }

        if (this.priceSumPerStoreCheckbox!.checked && items.length > 0) {
            STORE_KEYS.forEach((store) => {
                const storeItems = items.filter((item) => item.store === store);
                if (storeItems.length > 0) {
                    itemsToShow.push({
                        name: i18n("Price sum for store")(store),
                        priceHistory: calculateOverallPriceChanges(storeItems, this.unitPrice, onlyToday, percentageChange, startDate, endDate),
                    });
                }
            });
        }

        items.forEach((item) => {
            if (item.chart) {
                const dates = uniqueDates([item], startDate, endDate);
                const prices = calculateItemPriceTimeSeries(item, this.unitPrice, percentageChange, startDate, dates)!;
                const priceHistory = [];
                if (!onlyToday) {
                    for (let i = 0; i < dates.length; i++) {
                        priceHistory.push({ date: dates[i], price: prices[i], unitPrice: prices[i] });
                    }
                } else {
                    priceHistory.push({ date: dates[dates.length - 1], price: prices[prices.length - 1], unitPrice: prices[prices.length - 1] });
                }
                const chartItem = {
                    name: item.store + " " + item.name,
                    priceHistory,
                };
                itemsToShow.push(chartItem);
            }
        });

        this.renderChart(itemsToShow, onlyToday ? "bar" : "line", startDate);
    }

    renderChart(items: { name: string; priceHistory: Price[]; store?: string }[], chartType: string, startDate: string) {
        const getPrice = this.unitPrice ? (p: Price) => p.unitPrice : (p: Price) => p.price;
        const canvas = this.canvas!;
        const percentageChange = this.percentageChangeCheckbox!.checked;

        const now = performance.now();
        const datasets = items.map((item) => {
            const prices = item.priceHistory;

            const dataset = {
                label: (item.store ? item.store + " " : "") + item.name,
                data: prices.map((price) => {
                    return {
                        x: moment(price.date),
                        y: getPrice(price),
                    };
                }),
                stepped: "after",
            };
            dataset.stepped =
                prices.length >= 2 && prices[0].price != prices[1].price && prices[prices.length - 2].price != prices[prices.length - 1].price
                    ? "after"
                    : "before";

            return dataset;
        });

        const ctx = canvas.getContext("2d");
        let scrollTop = -1;
        if ((canvas as any).lastChart) {
            scrollTop = document.documentElement.scrollTop;
            (canvas as any).lastChart.destroy();
        }

        let yAxis = {
            ticks: {
                callback: function (value: any, index: any, ticks: any) {
                    return value.toLocaleString(navigator.language || "de-DE", {
                        minimumFractionDigits: 2,
                        style: "currency",
                        currency: "EUR",
                    });
                },
            },
            title: {
                display: false,
                text: "",
            },
        };
        if (percentageChange) {
            yAxis = {
                title: {
                    display: true,
                    text: i18n("% change since")(startDate),
                },
                ticks: {
                    callback: (value) => {
                        return value + "%";
                    },
                },
            };
        }

        (canvas as any).lastChart = new Chart(ctx, {
            type: chartType ? chartType : "line",
            data: {
                datasets: datasets,
            },
            options: {
                layout: {
                    padding: 16,
                },
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: "time",
                        adapters: {
                            date: moment,
                        },
                        time: {
                            unit: "day",
                            displayFormats: {
                                day: "YYYY-MM-D",
                            },
                        },
                        title: {
                            display: true,
                            text: "Date",
                        },
                    },
                    y: yAxis,
                },
            },
        });
        if (scrollTop != -1) document.documentElement.scrollTop = scrollTop;
    }

    render() {
        const result = html`<div class="px-4 pb-4 bg-[#E7E5E4]">
            <div class="w-full grow">
                <canvas id="canvas" class="bg-white rounded-lg min-h-[50vh]"></canvas>
            </div>
            <div class="flex items-center flex-wrap justify-center text-xs gap-2 pt-2">
                <hp-checkbox id="priceSum" @change=${() => this.requestUpdate()} .checked="true">${i18n("Price sum")}</hp-checkbox>
                <hp-checkbox id="priceSumPerStore" @change=${() => this.requestUpdate()}>${i18n("Price sum per store")}</hp-checkbox>
                <hp-checkbox id="todayOnly" @change=${() => this.requestUpdate()}>${i18n("Today's prices only")}</hp-checkbox>
                <hp-checkbox id="percentageChange" @change=${() => this.requestUpdate()}>${i18n("Percentage change")}</hp-checkbox>
                <div
                    class="cursor-pointer inline-flex items-center gap-x-1 rounded-full bg-white border border-gray-400 px-2 py-1 text-xs font-medium text-gray-600"
                >
                    <input id="startDate" type="date" value="2023-01-01" @change=${() => this.requestUpdate()} />
                    -
                    <input id="endDate" type="date" value="${today()}" @change=${() => this.requestUpdate()} />
                </div>
            </div>
        </div>`;

        return result;
    }
}

function calculateOverallPriceChanges(
    items: Item[],
    unitPrice: boolean,
    onlyToday: boolean,
    percentageChange: boolean,
    startDate: string,
    endDate: string
) {
    const getPrice = unitPrice ? (p: Price) => p.unitPrice : (p: Price) => p.price;

    if (onlyToday) {
        let sum = 0;
        for (const item of items) sum += getPrice(item);
        return [{ date: today(), price: sum, unitPrice: sum }];
    }

    const dates = uniqueDates(items, startDate, endDate);

    let priceChanges = new Array<{ date: string; price: number; unitPrice: number }>(dates.length);
    for (let i = 0; i < dates.length; i++) {
        priceChanges[i] = { date: dates[i], price: 0, unitPrice: 0 };
    }

    let numItems = 0;
    items.forEach((product) => {
        const priceScratch = calculateItemPriceTimeSeries(product, unitPrice, percentageChange, startDate, dates);
        if (priceScratch == null) return null;
        numItems++;

        for (let i = 0; i < priceScratch.length; i++) {
            const price = priceScratch[i]!;
            priceChanges[i].price += price;
            priceChanges[i].unitPrice += price;
        }
    });

    if (percentageChange) {
        for (let i = 0; i < priceChanges.length; i++) {
            priceChanges[i].price /= numItems;
            priceChanges[i].unitPrice /= numItems;
        }
    }

    return priceChanges;
}
