import { Store } from "./models";

export const stores: Record<string, Store> = {
    spar: {
        name: "Spar",
        budgetBrands: ["s-budget"],
        color: "green",
        defaultChecked: true,
        getUrl: (item) => `https://www.interspar.at/shop/lebensmittel/p/${item.id}`,
    },
};

export const STORE_KEYS = Object.keys(stores);
export const BUDGET_BRANDS = Object.values(stores)
    .map((store) => store.budgetBrands)
    .flat();
