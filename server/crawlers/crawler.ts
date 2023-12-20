import { Category, Item, Store } from "../../common/models";

export interface Crawler {
    store: Store;
    categories: Record<any, any>;
    fetchCategories(): Promise<Record<any, any>>;
    fetchData(): Promise<any[]>;
    getCanonical(rawItem: any, today: string): Item;
}
