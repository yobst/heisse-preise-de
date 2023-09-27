interface Messages {
    "Hot Prices": string;
    Search: string;
    "Price Changes": string;
    Carts: string;
    "Product Search": string;
    "footer-1": string;
    "footer-2": string;
    "search placeholder": string;
    "Discount store brands only": string;
    "Organic only": string;
    Price: string;
    "currency symbol": "€";
    All: string;
    Store: string;
    Name: string;
    Results: string;
    Chart: string;
    "Sales price": string;
    "Unit price": string;
    "Sort by": string;
    "Price ascending": string;
    "Price descending": string;
    "Quantity ascending": string;
    "Quantity descending": string;
    "Store & name": string;
    "Name similarity": string;
}

const english: Messages = {
    "Hot Prices": "Hot Prices",
    Search: "Search",
    "Price Changes": "Price Changes",
    Carts: "Carts",
    "Product Search": "Product Search",
    "footer-1": "All information without guarantee, subject to errors.",
    "footer-2": "Brand names and trademarks are the property of their respective owners.",
    "search placeholder": "Product search, min. 3 characters",
    "Discount store brands only": "Discount store brands only",
    "Organic only": "Organic only",
    Price: "Price",
    "currency symbol": "€",
    All: "All",
    Store: "Store",
    Name: "Name",
    Results: "Results",
    Chart: "Chart",
    "Sales price": "Sales price",
    "Unit price": "Unit price",
    "Sort by": "Sort by",
    "Price ascending": "Price ascending",
    "Price descending": "Price descending",
    "Quantity ascending": "Quantity ascending",
    "Quantity descending": "Quantity descending",
    "Store & name": "Store & name",
    "Name similarity": "Name similarity",
};

const german: Messages = {
    "Hot Prices": "Heisse Preise",
    Search: "Suche",
    "Price Changes": "Preisänderungen",
    Carts: "Warenkörbe",
    "Product Search": "Produktsuche",
    "footer-1": "Alle Angaben ohne Gewähr, Irrtümer vorbehalten.",
    "footer-2": "Markennamen und Warenzeichen sind Eigentum der jeweiligen Inhaber.",
    "search placeholder": "Produkt Suche, min. 3 Zeichen",
    "Discount store brands only": "Nur Diskont-Eigenmarken",
    "Organic only": "Nur Bio",
    Price: "Preis",
    "currency symbol": "€",
    All: "Alle",
    Store: "Kette",
    Name: "Name",
    Results: "Resultate",
    Chart: "Diagramm",
    "Sales price": "Verkaufspreis",
    "Unit price": "Mengenpreis",
    "Sort by": "Sortieren nach",
    "Price ascending": "Preis aufsteigend",
    "Price descending": "Preis absteigend",
    "Quantity ascending": "Menge aufsteigend",
    "Quantity descending": "Menge absteigend",
    "Store & name": "Kette & Name",
    "Name similarity": "Namesähnlickeit",
};

export type LanguageCode = "en" | "de";

const translations: Record<LanguageCode, Messages> = {
    en: english,
    de: german,
};

export function i18n<T extends keyof Messages>(key: T): Messages[T] {
    const userLocale = navigator.language || (navigator as any).userLanguage;
    const languageCode = userLocale ? (userLocale.split("-")[0] as LanguageCode) : "en";
    const implementation = translations[languageCode];
    const message = implementation[key];
    return message;
}
