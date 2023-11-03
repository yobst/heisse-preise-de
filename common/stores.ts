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
    lidl: {
        id: "lidl",
        displayName: "Lidl",
        budgetBrands: ["milbona", "alpengut", "cien", "livarno", "wiesentaler"],
        color: "pink",
        defaultChecked: true,
        getUrl: (item) => `https://www.lidl.de${item.url}`,
        productUrlBase: "https://www.lidl.de/",
        removeOld: true,
    },
    dm: {
        id: "dm",
        displayName: "DM",
        budgetBrands: ["balea"],
        color: "teal",
        defaultChecked: false,
        getUrl: (item) => `https://www.dm.de/product-p${item.id}.html`,
        productUrlBase: "https://www.dm.de/",
        removeOld: false,
    },
    rewe: {
        id: "rewe",
        displayName: "REWE",
        budgetBrands: ["ja!"],
        color: "stone",
        defaultChecked: false,
        getUrl: (item) => `https://shop.rewe.de/p/${item.name.toLowerCase().replace(allSpacesRegex, "-")}/${item.id}`,
        productUrlBase: "https://shop.rewe.de/p/",
        removeOld: false,
    },
    mueller: {
        id: "mueller",
        displayName: "Müller",
        budgetBrands: ["aveo"],
        color: "stone",
        defaultChecked: false,
        getUrl: (item) => `https://www.muller.de/${item.url}`,
        productUrlBase: "https://www.muller.de/",
        removeOld: false,
    },
    aldi: {
        id: "aldi",
        displayName: "Aldi",
        budgetBrands: ["milsana"],
        color: "lime",
        defaultChecked: true,
        getUrl: (item) => `https://www.mein-aldi.de/product/${item.url}`,
        productUrlBase: "https://www.mein-aldi.de/product/",
        removeOld: false,
    },
};

export const STORE_KEYS = Object.keys(stores);
export const BUDGET_BRANDS = Object.values(stores)
    .map((store) => store.budgetBrands)
    .flat();
