import { Unit, UnitMapping, units } from "../../common/models";

export function normalizeUnitAndQuantity(
    itemName: string,
    rawUnit: string | undefined,
    rawQuantity: string | number,
    storeUnits: Record<string, UnitMapping>,
    store: string,
    defaultValue: { quantity: number; unit: Unit }
) {
    if (!rawUnit) return defaultValue;
    if (!(typeof rawQuantity == "string" || typeof rawQuantity == "number")) return defaultValue;

    let quantity: number = typeof rawQuantity == "string" ? parseFloat(rawQuantity.replace(",", ".")) : rawQuantity;
    let unit: string = rawUnit.toLowerCase();

    const mapping = unit in units ? units[unit] : storeUnits[unit];
    if (!mapping) {
        console.error(`Unknown unit in ${store}: '${unit}' in item ${itemName}`);
        return defaultValue;
    }

    return { quantity: mapping.factor * quantity, unit: mapping.unit };
}

export function extractRawUnitAndQuantityFromEndOfString(str: string, defaultValue: any) {
    const tokens = str.trim().replaceAll("(", "").replaceAll(")", "").split(" ");
    const lastToken = tokens[tokens.length - 1].replaceAll(",", ".");
    const secondLastToken = tokens.length >= 2 && !tokens[tokens.length - 2].endsWith(",") ? tokens[tokens.length - 2].replaceAll(",", ".") : "";
    const token = /\d/.test(lastToken) ? lastToken : /^\d+(.\d*)?$/.test(secondLastToken) ? secondLastToken + lastToken : "";
    const regex = /^([0-9.x]+)([^0-9]*)$/;
    const matches = token.match(regex);

    let unit = defaultValue.unit;
    let quantity = defaultValue.quantity;

    if (matches && matches[2].trim().length > 0) {
        matches[1].split("x").forEach((q) => {
            quantity = quantity * parseFloat(q);
        });
        unit = matches[2];
    }
    return { rawQuantity: quantity, rawUnit: unit.toLowerCase() };
}

export function extractRawUnitAndQuantityFromDescription(description: string, defaultValue: any) {
    const parts = description.split(/(?:, |[()])/);

    let unit = defaultValue.unit;
    let quantity = defaultValue.quantity;

    for (let part of parts.reverse()) {
        const res = extractRawUnitAndQuantityFromEndOfString(part, defaultValue);
        quantity = res.rawQuantity;
        unit = res.rawUnit;
        if (unit != defaultValue.unit) break;
    }

    return { rawQuantity: quantity, rawUnit: unit.toLowerCase() };
}
