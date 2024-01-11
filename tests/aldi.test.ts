
import { AldiCrawler } from "../server/crawlers/aldi";
import * as aldi from "../server/crawlers/aldi";

const rawItem = {
    "name": "KINDER Country 211,5 g",
    "productConcreteSku": "000000000000153426",
    "prices": [{"grossAmount": 279}],
    "preFormattedUnitContent": "0.212 KG"
}

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": "000000000000153426", 
    "isOrganic": false, 
    "isWeighted": false, 
    "name": "KINDER Country 211,5 g", 
    "price": 2.79, 
    "priceHistory": [{"date": "1980-01-01", "price": 2.79, "unitPrice": 0}], 
    "quantity": 212, 
    "search": "",
    "sorted": false, 
    "store": "aldi", 
    "unavailable": false, 
    "unit": "g", 
    "url": undefined
};

describe('aldi scraper', () => {
    const crawler = new AldiCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(aldi.getQuantityAndUnit(rawItem, "Aldi")).toEqual({ "quantity": 212, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
