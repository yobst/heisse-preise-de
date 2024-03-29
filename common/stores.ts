import { Store } from "./models";

const allSpacesRegex = / /g;

export const stores: Record<string, Store> = {
    aldi: {
        id: "aldi",
        displayName: "Aldi",
        budgetBrands: ["milsana"],
        color: "blue",
        defaultChecked: true,
        getUrl: (item) => `https://www.mein-aldi.de/product/${item.url}`,
        productUrlBase: "https://www.mein-aldi.de/product/",
        removeOld: false,
    },
    biomarkt: {
        id: "biomarkt",
        displayName: "Biomarkt",
        budgetBrands: [],
        color: "green",
        defaultChecked: false,
        getUrl: (_) => `https://www.biomarkt.de/angebote`,
        productUrlBase: "https://www.biomarkt.de/angebote",
        removeOld: false,
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
    edeka: {
        id: "edeka",
        displayName: "Edeka",
        budgetBrands: ["gut&günstig"],
        color: "yellow",
        defaultChecked: false,
        getUrl: (_) => `https://www.edeka.de/offers`, // no product page available
        productUrlBase: "https://www.edeka.de/offers",
        removeOld: false,
    },
    flink: {
        id: "flink",
        displayName: "Flink",
        budgetBrands: ["ja!"],
        color: "pink",
        defaultChecked: false,
        getUrl: (item) => `https://www.goflink.com/de-DE/shop/product/${item.url}`,
        productUrlBase: "https://www.goflink.com/de-DE/shop/product/",
        removeOld: false,
    },
    lidl: {
        id: "lidl",
        displayName: "Lidl",
        budgetBrands: ["milbona", "alpengut", "cien", "livarno", "wiesentaler"],
        color: "yellow",
        defaultChecked: true,
        getUrl: (item) => `https://www.lidl.de${item.url}`,
        productUrlBase: "https://www.lidl.de/",
        removeOld: true,
    },
    mueller: {
        id: "mueller",
        displayName: "Müller",
        budgetBrands: ["aveo"],
        color: "orange",
        defaultChecked: false,
        getUrl: (item) => `https://www.muller.de/${item.url}`,
        productUrlBase: "https://www.muller.de/",
        removeOld: false,
    },
    rewe: {
        id: "rewe",
        displayName: "Rewe",
        budgetBrands: ["ja!"],
        color: "red",
        defaultChecked: false,
        getUrl: (item) => `https://shop.rewe.de/p/${item.name.toLowerCase().replace(allSpacesRegex, "-")}/${item.id}`,
        productUrlBase: "https://shop.rewe.de/p/",
        removeOld: false,
    },
};

export const STORE_KEYS = Object.keys(stores);
export const BUDGET_BRANDS = Object.values(stores)
    .map((store) => store.budgetBrands)
    .flat();
