
import { ReweCrawler } from "../server/crawlers/rewe";
import * as rewe from "../server/crawlers/rewe";

const rawItem = {
    "id": "1041140",
    "productName": "Schalotten 250g im Netz",
    "attributes": {
        "tags": {
            "discounted": {
                "label": "Angebote"
            }
        }
    },
    "brand": {
        "name": null
    },
    "_embedded": {
        "articles": [
            {
                "gtin": "22609793",
                "_embedded": {
                    "listing": {
                        "id": "8-22609793-rewe-online-services|4540858-565236",
                        "version": 1200008,
                        "pricing": {
                            "currentRetailPrice": 88,
                            "basePrice": 352,
                            "baseUnit": {
                                "KG": 1
                            },
                            "discount": {
                                "regularPrice": 129,
                                "validFrom": null,
                                "validTo": "2024-01-13T00:00:00MEZ"
                            },
                            "grammage": "250g (1 kg = 3,52 €)"
                        }
                    }
                }
            }
        ],
        "categoryPath": "Obst & Gemüse/Frisches Gemüse/Zwiebeln & Knoblauch/"
    },
    "_links": {
        "detail": {
            "href": "/p/schalotten-250g-im-netz/1041140"
        }
    }
}
;

const canonizedItem = {
    "category": "Unknown", 
    "chart": false, 
    "id": "1041140", 
    "isOrganic": false, 
    "isWeighted": false, 
    "name": "Schalotten 250g im Netz", 
    "price": 0.88, 
    "priceHistory": [{"date": "1980-01-01", "price": 0.88, "unitPrice": 0}], 
    "quantity": 250, 
    "search": "",
    "sorted": false, 
    "store": "rewe", 
    "unavailable": false, 
    "unit": "g", 
    "url": "/p/schalotten-250g-im-netz/1041140"
};

describe('rewe scraper', () => {
    const crawler = new ReweCrawler();
    const today = "1980-01-01";
    test('unit and quantity extraction succeeds', () => {
        expect(rewe.getQuantityAndUnit(rawItem, "Rewe")).toEqual({ "quantity": 250, "unit": "g",});
    });
    test('item canonization succeeds', () => {
        expect(crawler.getCanonical(rawItem, today)).toEqual(canonizedItem);
    });
});
