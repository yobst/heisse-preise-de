
import { FlinkCrawler } from "../server/crawlers/flink";
import * as flink from "../server/crawlers/flink";

const rawItem = {
    "id": "f759ff23-cc4a-4eb2-95cc-4b8a9e14d613",
    "name": "Ben & Jerry's The Classic Cool-lection 400ml (4x100ml)",
    "category_id": "eb402c61-7ef2-4ad4-80c3-91b71160f989",
    "slug": "",
    "sku": "15000476",
    "quantity": 5,
    "price": {
        "amount": 6.99
    },
    "categories": [
        "eb402c61-7ef2-4ad4-80c3-91b71160f989",
        "828522c2-50c5-4475-a778-8c9cd8729749",
        "7e67f052-829a-4959-8a84-6daa2a26f17d"
    ]
};

const canonizedItem = {
    "category": "Unknown",
    "chart": false,
    "id": "f759ff23-cc4a-4eb2-95cc-4b8a9e14d613",
    "isOrganic": false,
    "isWeighted": false,
    "name": "Ben & Jerry's The Classic Cool-lection 400ml (4x100ml)",
    "price": 6.99,
    "priceHistory": [
        {
            "date": "1980-01-01",
            "price": 6.99,
            "unitPrice": 0,
        },
    ],
    "quantity": 400,
    "search": "",
    "sorted": false,
    "store": "flink",
    "unavailable": false,
    "unit": "ml",
    "url": "",
};

describe('flink scraper', () => {
    const crawler = new FlinkCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(flink.getQuantityAndUnit(rawItem, "Biomarkt")).toEqual({ "quantity": 400, "unit": "ml", });
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
