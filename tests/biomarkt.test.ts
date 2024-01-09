
import { BiomarktCrawler } from "../server/crawlers/biomarkt";
import * as biomarkt from "../server/crawlers/biomarkt";

const rawItem = {
    "vegetarian": true,
    "articleGroup": {
        "productGroup": {
            "order": 0,
            "title": "Obst & Gemüse"
        }
    },
    "price": "2,85",
    "angebotsart": "Vorteilspreis",
    "vegan": true,
    "shordesc": "lose oder im 1-kg-Zellulosenetz, aus Italien, Spanien oder Griechenland, HKL II",
    "labels": [
        {
            "title": "EU-Bio-Siegel",
            "image": "https://cdn.sanity.io/images/or2m2oma/production/ba9e3834475695188dac6fb50b6b7e4fe3b6ac05-240x280.png"
        }
    ],
    "subtitle": "je 1 kg",
    "title": "Clementinen",
    "productGroup": {
        "_key": "283ed9fb-47d9-4e47-ad62-8ab20a968633",
        "_ref": "obst-und-gemuese"
    },
    "id": "cec6f8b1-c672-4fda-a750-ac22b2cb19d1",
    "fresh": true
};

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": "cec6f8b1-c672-4fda-a750-ac22b2cb19d1", 
    "isOrganic": false, 
    "isWeighted": false, 
    "name": "Clementinen", 
    "price": 2.85, 
    "priceHistory": [{"date": "1980-01-01", "price": 2.85, "unitPrice": 0}], 
    "quantity": 1000, 
    "search": "",
    "sorted": false, 
    "store": "biomarkt", 
    "unavailable": false, 
    "unit": "g", 
    "url": undefined};

describe('biomarkt scraper', () => {
    const crawler = new BiomarktCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(biomarkt.getQuantityAndUnit(rawItem, "Biomarkt")).toEqual({ "quantity": 1000, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
