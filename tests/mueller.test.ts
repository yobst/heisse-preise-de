import { MuellerCrawler } from "../server/crawlers/mueller";

const rawItem = {
    "name": "Alnatura Bio Soja Sauce Shoyu",
    "impressionDataLayer": {
        "ecommerce": {
            "impressions": [
                {
                    "name": "Alnatura Bio Soja Sauce Shoyu",
                    "id": "2063974",
                    "price": "2.99",
                    "category": "Drogerie/Lebensmittel/Nahrung/Gewürze",
                }
            ]
        }
    },
    "quantityOfContent": "250 ml",
    "productUrl": "https://www.mueller.de/p/alnatura-bio-soja-sauce-shoyu-2063974/",
    "availabilityInfo": "",
};

const canonizedItem = {
    "category": "Unknown",
    "chart": false,
    "id": "2063974",
    "isOrganic": true,
    "isWeighted": false,
    "name": "Alnatura Bio Soja Sauce Shoyu",
    "price": 2.99,
    "priceHistory": [
        {
            "date": "1980-01-01",
            "price": 2.99,
            "unitPrice": 0,
        },
    ],
    "quantity": 250,
    "search": "",
    "sorted": false,
    "store": "mueller",
    "unavailable": false,
    "unit": "ml",
    "url":  "https://www.mueller.de/p/alnatura-bio-soja-sauce-shoyu-2063974/"
};

describe('mueller scraper', () => {
    const crawler = new MuellerCrawler();
    const today = "1980-01-01";
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
