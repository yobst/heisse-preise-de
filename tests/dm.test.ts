
import { DmCrawler } from "../server/crawlers/dm";

const rawItem = {
    "gtin": 4066447581843,
    "name": "Pflanzendrink, Haferdrink Natur",
    "brandName": "dmBio",
    "title": "Pflanzendrink, Haferdrink Natur, 1 l",
    "notAvailable": false,
    "relativeProductUrl": "/dmbio-pflanzendrink-haferdrink-natur-p4066447581843.html",
    "price": {
        "value": 0.95,
    },
    "contentUnit": "l",
    "netQuantityContent": 1.0,
    "categoryNames": [
        "Pflanzendrinks"
    ]
};

const canonizedItem = {
    "category": "Unknown",
    "chart": false,
    "id": 4066447581843,
    "isOrganic": true,
    "isWeighted": false,
    "name": "dmBio Pflanzendrink, Haferdrink Natur",
    "price": 0.95,
    "priceHistory": [
        {
            "date": "1980-01-01",
            "price": 0.95,
            "unitPrice": 0,
        },
    ],
    "quantity": 1000,
    "search": "",
    "sorted": false,
    "store": "dm",
    "unavailable": false,
    "unit": "ml",
    "url":  "/dmbio-pflanzendrink-haferdrink-natur-p4066447581843.html"
};

describe('dm scraper', () => {
    const crawler = new DmCrawler();
    const today = "1980-01-01";
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
