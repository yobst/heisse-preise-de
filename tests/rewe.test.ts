
import { ReweCrawler } from "../server/crawlers/rewe";
import * as rewe from "../server/crawlers/rewe";

const rawItem = {
    "id": "1902921",
    "name": "Paprika rot 500g",
    "grammage": "500g (1 kg = 2,98 €)",
    "currentPrice": "1,49 €",
    "hasBioCide": false,
    "orderLimit": 99
};

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": "1902921", 
    "isOrganic": false, 
    "isWeighted": false, 
    "name": "Paprika rot 500g", 
    "price": 1.49, 
    "priceHistory": [{"date": "1980-01-01", "price": 1.49, "unitPrice": 0}], 
    "quantity": 500, 
    "search": "",
    "sorted": false, 
    "store": "rewe", 
    "unavailable": false, 
    "unit": "g", 
    "url": undefined
};

describe('rewe scraper', () => {
    const crawler = new ReweCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(rewe.getQuantityAndUnit(rawItem, "Rewe")).toEqual({ "quantity": 500, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
