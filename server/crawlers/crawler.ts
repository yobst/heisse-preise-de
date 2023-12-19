import { Category, Item, Store } from "../../common/models";

export interface Crawler {
    store: Store;
    categories: any[];
    fetchCategories(): Promise<any[]>;
    fetchData(): Promise<any[]>;
    getCanonical(rawItem: any, today: string): Item;
    getCategory(rawItem: any): Category;
}
