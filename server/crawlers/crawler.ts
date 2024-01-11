import { Item, Store } from "../../common/models";

export interface Crawler {
    store: Store;
    categories: Record<string, any>;
    fetchCategories(): Promise<Record<any, any>>;
    fetchData(): Promise<any[]>;
    getCanonical(rawItem: any, today: string): Item;
}
