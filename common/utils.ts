import { Item } from "./models";
import { BUDGET_BRANDS, stores } from "./stores";

export function itemsToCSV(items: Item[]) {
    let result = "store;id;name;priceDate;price;isBudgetBrand;quantity;unit;isWeighted;isOrganic;isAvailable;url\n";
    for (const item of items) {
        if (item.store == "lidl" || item.store == "penny") continue;
        let rowFront = "";
        rowFront += item.store + ";";
        rowFront += `"${item.id}"` + ";";
        rowFront += item.name.replace(";", " ") + ";";

        let rowBack = ";";
        rowBack += BUDGET_BRANDS.some((budgetBrand) => item.name.toLowerCase().indexOf(budgetBrand) >= 0) + ";";
        rowBack += item.quantity + ";";
        rowBack += item.unit + ";";
        rowBack += (item.isWeighted ?? false) + ";";
        rowBack += (item.isOrganic ?? false) + ";";
        rowBack += !(item.unavailable ?? false) + ";";
        if (stores[item.store]) {
            rowBack += stores[item.store].getUrl(item) + ";";
        } else {
            console.log("Store", item.store, "not found!");
            rowBack += ";";
        }

        for (const price of item.priceHistory) {
            result += rowFront + price.date + ";" + price.price + rowBack + "\n";
        }
    }
    return result;
}

export function today() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
