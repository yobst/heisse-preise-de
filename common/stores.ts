import { Store } from "./models";

export const stores: Record<string, Store> = {
    spar: {
        id: "spar",
        displayName: "Spar",
        budgetBrands: ["s-budget"],
        color: "green",
        defaultChecked: true,
        removeOld: false,
        getUrl: (item) => `https://www.interspar.at/shop/lebensmittel/p/${item.id}`,
        productUrlBase: "https://www.interspar.at/shop/lebensmittel/p/",
    },
};

export const STORE_KEYS = Object.keys(stores);
export const BUDGET_BRANDS = Object.values(stores)
    .map((store) => store.budgetBrands)
    .flat();
