
import { EdekaCrawler } from "../server/crawlers/edeka";
import * as edeka from "../server/crawlers/edeka";

const rawItem = {
    "id": 352259791,
    "title": "Bio Orangen",
    "price": { "rawValue": 1.0 },
    "description": "aus Spanien oder Italien, Klasse II, 1kg"
};

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": 352259791, 
    "isOrganic": true, 
    "isWeighted": false, 
    "name": "Bio Orangen", 
    "price": 1.0, 
    "priceHistory": [{"date": "1980-01-01", "price": 1.0, "unitPrice": 0}], 
    "quantity": 1000, 
    "search": "",
    "sorted": false, 
    "store": "edeka", 
    "unavailable": false, 
    "unit": "g", 
    "url": undefined
};

describe('edeka scraper', () => {
    const crawler = new EdekaCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(edeka.getQuantityAndUnit(rawItem, "Edeka")).toEqual({ "quantity": 1000, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
