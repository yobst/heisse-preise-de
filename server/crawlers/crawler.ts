import { Category, Item, Store } from "../../common/models";

export interface Crawler {
    store: Store;
    fetchData(): Promise<any[]>;
    getCanonical(rawItem: any, today: string): Item;
    getCategory(rawItem: any): Category;
}
