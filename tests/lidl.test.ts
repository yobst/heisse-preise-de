
import { LidlCrawler } from "../server/crawlers/lidl";
import * as lidl from "../server/crawlers/lidl";

const rawItem = {
    "canonicalUrl": "/p/melitta-kaffee-auslese/p10022715",
    "category": "Food",
    "fullTitle": "Melitta Kaffee Auslese",
    "price": {
        "packaging": {
            "text": "Je 500 g"
        },
        "price": 4.66,
    },
    "productId": 10022715,
    "stockAvailability": {
        "availabilityIndicator": 0,
    }
};

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": 10022715, 
    "isOrganic": false, 
    "isWeighted": false, 
    "name": "Melitta Kaffee Auslese", 
    "price":4.66, 
    "priceHistory": [{"date": "1980-01-01", "price": 4.66, "unitPrice": 0}], 
    "quantity": 500, 
    "search": "",
    "sorted": false, 
    "store": "lidl",
       "unavailable": true,
       "unit": "g",
       "url": "/p/melitta-kaffee-auslese/p10022715"
};

describe('lidl scraper', () => {
    const crawler = new LidlCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(lidl.getQuantityAndUnit(rawItem, "Lidl")).toEqual({ "quantity": 500, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
