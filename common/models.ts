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
    | "Alles / Frisches Obst & Gemüse / Gemüse / Salate"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Salate / Feldsalat"
    | "Alles / Frisches Obst & Gemüse / Gemüse / Salate / Kopfsalat"
    | "Alles / Frisches Obst & Gemüse / Kräuter"
    | "Alles / Frisches Obst & Gemüse / Obst"
    | "Alles / Frisches Obst & Gemüse / Obst / Äpfel"
    | "Alles / Frisches Obst & Gemüse / Obst / Birnen"
    | "Alles / Frisches Obst & Gemüse / Obst / Erdbeeren"
    | "Alles / Frisches Obst & Gemüse / Obst / Bananen"
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
    | "Alles / Gekühltes / Frisch & Fertig"
    | "Alles / Gekühltes / Frisch & Fertig / Antipasti"
    | "Alles / Gekühltes / Frisch & Fertig / Backwaren & frische Fertigteige"
    | "Alles / Gekühltes / Frisch & Fertig / Fertiggerichte & Snacks"
    | "Alles / Gekühltes / Frisch & Fertig / Frische Pasta & Beilagen"
    | "Alles / Gekühltes / Frisch & Fertig / Frische Suppen"
    | "Alles / Gekühltes / Frisch & Fertig / Frische Säfte & Smoothies"
    | "Alles / Gekühltes / Frisch & Fertig / Obst- & Gemüsesnacks"
    | "Alles / Gekühltes / Frisch & Fertig / Salat & Kalte Bowls"
    | "Alles / Gekühltes / Frisch & Fertig / Sandwiches & Wraps"
    | "Alles / Gekühltes / Frisch & Fertig / Müsli & Süßes"
    | "Alles / Gekühltes / Frisch & Fertig / Sushi"
    | "Alles / Gekühltes / Fisch & Fleisch"
    | "Alles / Gekühltes / Fisch & Fleisch / Fisch & Meeresfrüchte"
    | "Alles / Gekühltes / Fisch & Fleisch / Fisch- & Fleischsalate"
    | "Alles / Gekühltes / Fisch & Fleisch / Fleisch- & Fischalternativen"
    | "Alles / Gekühltes / Fisch & Fleisch / Schwein"
    | "Alles / Gekühltes / Fisch & Fleisch / Geflügel"
    | "Alles / Gekühltes / Fisch & Fleisch / Hackfleisch & Burger"
    | "Alles / Gekühltes / Fisch & Fleisch / Lamm & Wild"
    | "Alles / Gekühltes / Fisch & Fleisch / Rind & Kalb"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Salami"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Schinken & Speck"
    | "Alles / Gekühltes / Fisch & Fleisch / Wurst & Aufschnitt / Streichwurst"
    | "Alles / Getränke"
    | "Alles / Getränke / Alkoholische Getränke"
    | "Alles / Getränke / Alkoholfreie Getränke"
    | "Alles / Getränke / Alkoholfreie Getränke / Smoothies"
    | "Alles / Getränke / Alkoholfreie Getränke / Eistee & Mate"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks"
    | "Alles / Getränke / Alkoholfreie Getränke / Getränkesirup"
    | "Alles / Getränke / Alkoholfreie Getränke / Sport- & Energydrinks"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / ACE-Saft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Ananassaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Apfelsaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Bananennektar"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Beerensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Birnensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Granatapfelsaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Grapefruitsaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Kirschnektar"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Mangosaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Maracujasaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Mehrfruchtsaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Orangensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Pfirsichsaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Pflaumensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Saft-Shots"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Traubensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Zitronen- & Limettensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Gemüsesaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Möhrensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Tomatensaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Rhabarbersaft"
    | "Alles / Getränke / Alkoholfreie Getränke / Säfte & Nektare / Rote-Bete-Saft"
    | "Alles / Getränke / Alkoholfreie Getränke / Wasser & Mineralwasser"
    | "Alles / Getränke / Alkoholfreie Getränke / Wasser mit Geschmack"
    | "Alles / Getränke / Alkoholfreie Getränke / Schorlen"
    | "Alles / Getränke / Alkoholfreie Getränke / Schorlen / Apfelschorlen"
    | "Alles / Getränke / Alkoholfreie Getränke / Schorlen / Rhabarberschorlen"
    | "Alles / Getränke / Alkoholfreie Getränke / Schorlen / Rote Schorlen"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Limonaden"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Cola & Colamix"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Bitter Lemon"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Ginger Ale & Beer"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Tonic Water"
    | "Alles / Getränke / Alkoholfreie Getränke / Softdrinks / Wild Berry"
    | "Alles / Ungekühltes"
    | "Alles / Ungekühltes / Backen & Dessertpulver"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backdekoration"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backmischungen"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Backzutaten"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Dessertpulver"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Getreide"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Getreide / Mehl"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Getreide / Amaranth"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Getreide / Buchweizen"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Zucker & Süßungsmittel"
    | "Alles / Ungekühltes / Backen & Dessertpulver / Zucker & Süßungsmittel / Zucker"
    | "Alles / Ungekühltes / Beilagen"
    | "Alles / Ungekühltes / Beilagen / Hülsenfrüchte"
    | "Alles / Ungekühltes / Beilagen / Kartoffelprodukte"
    | "Alles / Ungekühltes / Beilagen / Nudeln"
    | "Alles / Ungekühltes / Beilagen / Reis"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Dressings & Toppings"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Fertigsoßen"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Ketchup & Grillsoßen"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Mayonnaise & Remoulade"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Pesto"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Soßen & Dips / Senf, Meerettich & Wasabi"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Essig"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürzpasten"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Gewürze"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Brühe, Bouillons & Fonds"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Fixprodukte"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Gewürze & Würzmischungen / Salz"
    | "Alles / Ungekühltes / Essig, Öl, Soßen & Gewürze / Öle"
    | "Alles / Ungekühltes / Feinkost & Antipasti"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Obstkonserven & Fruchtmark"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Gemüsekonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Fleisch- & Wurstkonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Fischkonserven"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Dosengerichte"
    | "Alles / Ungekühltes / Fertiggerichte & Konserven / Instantgerichte"
    | "Alles / Ungekühltes / Frühstück"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Baguette"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Burgerbrötchen"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Brot"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Brötchen"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Knäckebrot"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Reiswaffeln"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Süße Backwaren"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Toast"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Wraps"
    | "Alles / Ungekühltes / Frühstück / Abgepackte Backwaren / Zwieback"
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
    | "Alles / Ungekühltes / Kaffee, Tee & Co."
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Kaffee"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Tee"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Trinkschokolade"
    | "Alles / Ungekühltes / Kaffee, Tee & Co. / Kaffeesahne & Kondensmilch"
    | "Alles / Ungekühltes / Nahrungsergänzungsmittel"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Cashewkerne"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Erdnüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Haselnüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Macadamianüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Mandeln"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Maronen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Nussmischungen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Paranüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Pecannüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Pistazien"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Walnüsse"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Kernemix"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Kürbiskerne"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Pinienkerne"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Nüsse, Samen & Kerne / Sonnenblumenkerne"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Cranberries"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Datteln"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Feigen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Fruchtmix"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Ananas"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Äpfel"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Aprikosen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Bananen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Beeren"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Kirschen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Ingwer"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Kokos"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Mangos"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Pflaumen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Trockenfrüchte / Rosinen & Sultaninen"
    | "Alles / Ungekühltes / Nüsse & Trockenfrüchte / Studentenfutter"
    | "Alles / Ungekühltes / Snacks"
    | "Alles / Ungekühltes / Snacks / Süße Snacks"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Popcorn"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Bonbons"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Lutscher"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Kaugummi"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Traubenzucker"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Fruchtgummi & Lakritz"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Schokolade & Schokoriegel"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßwaren / Marshmallows & Mäusespeck"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Süßgebäck"
    | "Alles / Ungekühltes / Snacks / Süße Snacks / Müsli-, Frucht- & Proteinriegel"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Chips"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Flips"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Cracker"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Laugengebäck"
    | "Alles / Ungekühltes / Snacks / Salzige Snacks / Tortillas"
    | "Alles / Ungekühltes / Sport- & Diätnahrung"
    | "Alles / Tiefgekühltes"
    | "Alles / Tiefgekühltes / Desserts & Backwaren"
    | "Alles / Tiefgekühltes / Eis"
    | "Alles / Tiefgekühltes / Gemüse"
    | "Alles / Tiefgekühltes / Fertiggerichte"
    | "Alles / Tiefgekühltes / Fleisch & Fisch"
    | "Alles / Tiefgekühltes / Kartoffelprodukte"
    | "Alles / Tiefgekühltes / Kräuter"
    | "Alles / Tiefgekühltes / Obst"
    | "Alles / Tiefgekühltes / Snacks"
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
