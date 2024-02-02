export type Unit = "stk" | "cm" | "g" | "ml" | "wg" | "qm" | "srv" | "zug" | "bund";

export type UnitMapping = { unit: Unit; factor: number };

export const units: Record<string, UnitMapping> = {
    "stk.": { unit: "stk", factor: 1 },
    blatt: { unit: "stk", factor: 1 },
    paar: { unit: "stk", factor: 1 },
    stk: { unit: "stk", factor: 1 },
    st: { unit: "stk", factor: 1 },
    teebeutel: { unit: "stk", factor: 1 },
    tücher: { unit: "stk", factor: 1 },
    rollen: { unit: "stk", factor: 1 },
    tabs: { unit: "stk", factor: 1 },
    stück: { unit: "stk", factor: 1 },
    mm: { unit: "cm", factor: 0.1 },
    cm: { unit: "cm", factor: 1 },
    zentimeter: { unit: "cm", factor: 1 },
    m: { unit: "cm", factor: 100 },
    meter: { unit: "cm", factor: 100 },
    g: { unit: "g", factor: 1 },
    gr: { unit: "g", factor: 1 },
    gramm: { unit: "g", factor: 1 },
    dag: { unit: "g", factor: 10 },
    kg: { unit: "g", factor: 1000 },
    kilogramm: { unit: "g", factor: 1000 },
    mg: { unit: "g", factor: 0.001 },
    milligramm: { unit: "g", factor: 0.001 },
    ml: { unit: "ml", factor: 1 },
    milliliter: { unit: "ml", factor: 1 },
    dl: { unit: "ml", factor: 10 },
    cl: { unit: "ml", factor: 100 },
    l: { unit: "ml", factor: 1000 },
    lt: { unit: "ml", factor: 1000 },
    liter: { unit: "ml", factor: 1000 },
    wg: { unit: "wg", factor: 1 },
    wl: { unit: "wg", factor: 1 },
    srv: { unit: "srv", factor: 1 }, // serving
    züge: { unit: "zug", factor: 1 },
    bund: { unit: "bund", factor: 1 }
};

export type Category =
    "Alles"
    | "Alles / Frische Backwaren"
    | "Alles / Frische Backwaren / Baguette"
    | "Alles / Frische Backwaren / Brot"
    | "Alles / Frische Backwaren / Brötchen"
    | "Alles / Frische Backwaren / Feingebäck"
    | "Alles / Frisches Obst & Gemüse"
    | "Alles / Frisches Obst & Gemüse / Gemüse"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Blattspinat"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Chinakohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Fenchel"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Frühlingszwiebeln"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Grünkohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Kartoffeln"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Kürbis"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Rosenkohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Rote Beete"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Rotkohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Spitzkohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Staudensellerie"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Weißkohl"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Wirsing"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Zucchini"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Zwiebeln"
    | "Alles / Frisches Obst & Gemüse / Kräuter"
    | "Alles / Frisches Obst & Gemüse / Obst"
    | "Alles / Frisches Obst & Gemüse / Obst / Äpfel"
    | "Alles / Frisches Obst & Gemüse / Obst / Birnen"
    | "Alles / Frisches Obst & Gemüse / Obst / Erdbeeren"
    | "Alles / Frisches Obst & Gemüse / Salate"
    | "Alles / Frisches Obst & Gemüse / Salate / Feldsalat"
    | "Alles / Frisches Obst & Gemüse / Salate / Kopfsalat"
    | "Alles / Gekühltes"
    | "Alles / Gekühltes / Eier & Molkereiprodukte"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette / Butter"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette / Kokosfett"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette / Kräuterbutter"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette / Margarine"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Butter, Margarine & Fette / Schmalz"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Eier & Eiersatz"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Eier & Eiersatz / Eier"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Dessert"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Fruchtjoghurt"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Naturjoghurt"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Sahnejoghurt"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Joghurtalternativen"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Quark"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Joghurt, Skyr, Quark & Dessert / Skyr"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Feta & Hirtenkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Frischkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Schmelzkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Koch- & Salatkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Käsealternativen"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Käsesnacks"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Mozzarella"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Ofen- & Grillkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Reibekäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Stück- & Schnittkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Käse / Weichkäse"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Milch & Milchalternativen"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Milch & Milchalternativen / Frischmilch"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Milch & Milchalternativen / H-Milch"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Milch & Milchalternativen / Pflanzendrinks"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Milch- & Kaffeegetränke"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Sahne, Schmand & Creme Fraiche"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Sahne, Schmand & Creme Fraiche / Creme Fraiche"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Sahne, Schmand & Creme Fraiche / Sahne"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Sahne, Schmand & Creme Fraiche / Sahnealternativen"
    | "Alles / Gekühltes / Eier & Molkereiprodukte / Sahne, Schmand & Creme Fraiche / Schmand"
    | "Alles / Gekühltes / Feinkost & Antipasti"
    | "Alles / Gekühltes / Feinkost & Antipasti / Antipasti"
    | "Alles / Gekühltes / Feinkost & Antipasti / Backwaren & frische Fertigteige"
    | "Alles / Gekühltes / Feinkost & Antipasti / Fertiggerichte & Snacks"
    | "Alles / Gekühltes / Feinkost & Antipasti / Frische Pasta & Beilagen"
    | "Alles / Gekühltes / Feinkost & Antipasti / Frische Suppen"
    | "Alles / Gekühltes / Feinkost & Antipasti / Frische Säfte & Smoothies"
    | "Alles / Gekühltes / Feinkost & Antipasti / Obst- & Gemüsesnacks"
    | "Alles / Gekühltes / Feinkost & Antipasti / Salat & Kalte Bowls"
    | "Alles / Gekühltes / Feinkost & Antipasti / Sandwiches & Wraps"
    | "Alles / Gekühltes / Feinkost & Antipasti / Sushi"
    | "Alles / Gekühltes / Fisch & Fleisch"
    | "Alles / Gekühltes / Fisch & Fleisch / Fisch & Meeresfrüchte"
    | "Alles / Gekühltes / Fisch & Fleisch / Fisch- & Fleischsalate"
    | "Alles / Gekühltes / Fisch & Fleisch / Fleisch- & Fischalternativen"
    | "Alles / Gekühltes / Fisch & Fleisch / Schwein"
    | "Alles / Gekühltes / Fisch & Fleisch / Geflügel"
    | "Alles / Gekühltes / Fisch & Fleisch / Grillen"
    | "Alles / Gekühltes / Fisch & Fleisch / Hackfleisch & Burger"
    | "Alles / Gekühltes / Fisch & Fleisch / Lamm & Wild"
    | "Alles / Gekühltes / Fisch & Fleisch / Rind & Kalb"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Salami"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Schinken & Speck"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Streichwurst"
    | "Alles / Getränke"
    | "Alles / Getränke / Smoothies"
    | "Alles / Getränke / Softdrinks"
    | "Alles / Getränke / Softdrinks / Eistee"
    | "Alles / Getränke / Softdrinks / Limonaden"
    | "Alles / Getränke / Softdrinks / Getränkesirup"
    | "Alles / Getränke / Softdrinks / Sport- & Energydrinks"
    | "Alles / Getränke / Säfte"
    | "Alles / Getränke / Säfte / Fruchtsäfte & Nektare"
    | "Alles / Getränke / Säfte / Gemüsesäfte"
    | "Alles / Getränke / Wasser & Mineralwasser"
    | "Alles / Nahrungsergänzungsmittel"
    | "Alles / Ungekühltes"
    | "Alles / Ungekühltes / Backen & Dessertpulver"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backdekoration"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backmischungen"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backzutaten"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Dessertpulver"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Mehl & Grieß"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Zucker & Süßungsmittel"
    | "Alles / Ungekühltes / Beilagen"
    | "Alles / Ungekühltes / Beilagen / Nudeln"
    | "Alles / Ungekühltes / Beilagen / Reis"
    | "Alles / Ungekühltes / Beilagen / Hülsenfrüchte"
    | "Alles / Ungekühltes / Beilagen / Kartoffelprodukte"
    | "Alles / Ungekühltes / Kaffee, Tee & Co."
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Kaffee"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Tee"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Trinkschokolade"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Kaffeesahne & Kondensmilch"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Dressings"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Ketchup & Grillsoßen"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Fertigsoßen"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Gewürzpasten"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Pesto"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Mayonnaise & Remoulade"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Senf & Meerettich"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Essig"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Öl"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Gewürze"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Brühe, Bouillons & Fonds"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Fixprodukte"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Salz"
    | "Alles / Ungekühltes / Frühstück"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Brot"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Brötchen"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Baguette"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Wraps"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Toast"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Burgerbrötchen"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Knäckebrot"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Zwieback"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Reiswaffeln"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Süße Backwaren"
    | "Alles / Ungekühltes / Frühstück / Brotaufstriche"
    | "Alles / Ungekühltes / Frühstück / Brotaufstriche / Fruchtaufstriche"
    | "Alles / Ungekühltes / Frühstück / Brotaufstriche / Honig"
    | "Alles / Ungekühltes / Frühstück / Brotaufstriche / Nuss- & Schokoladenaufstriche"
    | "Alles / Ungekühltes / Frühstück / Brotaufstriche / Herzhafte Aufstriche"
    | "Alles / Ungekühltes / Frühstück / Cerealien & Müsli"
    | "Alles / Ungekühltes / Frühstück / Cerealien & Müsli / Müsli"
    | "Alles / Ungekühltes / Frühstück / Cerealien & Müsli / Cerealien"
    | "Alles / Ungekühltes / Frühstück / Cerealien & Müsli / Haferflocken"
    | "Alles / Ungekühltes / Frühstück / Porridge & Frühstücksbrei"
    | "Alles / Ungekühltes / Snacks"
    | "Alles / Ungekühltes / Snacks / Süße Snacks"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Popcorn"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Bonbons, Lutscher & Kaugummi, Fruchtgummi & Lakritz"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Schokolade & Schokoriegel"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßgebäck"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Müsli-, Frucht- & Proteinriegel"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Chips"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Flips"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Cracker"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Laugengebäck"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Obstkonserven & Fruchtmark"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Gemüsekonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Fleisch- & Wurstkonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Fischkonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Dosengerichte"
    | "Alles / Ungekühltes / Backen & Dessertpulver"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Mehl & Gries"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Zucker & Süßungsmittel"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backmischungen"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backzutaten"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backdekoration"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Dessertpulver"
    | "Alles / Tiefgekühltes"
    | "Alles / Tiefgekühltes / Eis"
    | "Alles / Tiefgekühltes / Obst"
    | "Alles / Tiefgekühltes / Gemüse"
    | "Alles / Tiefgekühltes / Kräuter"
    | "Alles / Tiefgekühltes / Fleisch & Fisch"
    | "Alles / Tiefgekühltes / Fertiggerichte"
    | "Alles / Tiefgekühltes / Kartoffelprodukte"
    | "Alles / Tiefgekühltes / Desserts & Backwaren"
    | "Unknown";

export interface Price {
    date: string;
    price: number;
    unitPrice: number;
}

export class Item {
    public search: string = "";
    public vector?: Record<string, number>;
    public tokens?: string[];
    public sorted = false;
    public chart = false;

    constructor(
        public store: string,
        public id: string,
        public name: string,
        public category: Category,
        public unavailable: boolean,
        public price: number,
        public priceHistory: Price[],
        public isWeighted: boolean,
        public unit: Unit | undefined,
        public quantity: number,
        public isOrganic: boolean,
        public url?: string
    ) { }

    get unitPrice() {
        const unitPriceFactor = this.unit == "g" || this.unit == "ml" ? 1000 : 1;
        return (this.price / this.quantity) * unitPriceFactor;
    }

    get numPrices() {
        return this.priceHistory.length;
    }

    get date() {
        return this.priceHistory[0].date;
    }

    get priceOldest() {
        return this.priceHistory[this.priceHistory.length - 1].price;
    }

    get dateOldest() {
        return this.priceHistory[this.priceHistory.length - 1].date;
    }

    get price1() {
        return this.priceHistory[1] ? this.priceHistory[1].price : 0;
    }

    get date1() {
        return this.priceHistory[1] ? this.priceHistory[1].date : null;
    }

    get price2() {
        return this.priceHistory[1] ? this.priceHistory[1].price : 0;
    }

    get date2() {
        return this.priceHistory[1] ? this.priceHistory[1].date : null;
    }

    get price3() {
        return this.priceHistory[1] ? this.priceHistory[1].price : 0;
    }

    get date3() {
        return this.priceHistory[1] ? this.priceHistory[1].date : null;
    }

    get uniqueId() {
        return this.store + this.id;
    }
}

export interface Store {
    id: string;
    displayName: string;
    budgetBrands: string[];
    color: string;
    defaultChecked: boolean;
    removeOld: boolean;
    getUrl: (item: Item) => string;
    productUrlBase: string;
}
