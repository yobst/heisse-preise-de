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

export function extractRawUnitAndQuantityFromName(name: string, defaultValue: any) {
    let unit = defaultValue.unit;
    let quantity = defaultValue.quantity;

    const nameTokens = name.trim().replaceAll("(", "").replaceAll(")", "").replaceAll(",", ".").split(" ");
    const lastToken = nameTokens[nameTokens.length - 1];
    const secondLastToken = nameTokens.length >= 2 ? nameTokens[nameTokens.length - 2] : null;
    const token = parseFloat(lastToken) ? lastToken : secondLastToken + lastToken;
    const regex = /^([0-9.x]+)(.*)$/;
    const matches = token.match(regex);
    if (matches) {
        matches[1].split("x").forEach((q) => {
            quantity = quantity * parseFloat(q);
        });
        unit = matches[2];
    }
    return { rawQuantity: quantity, rawUnit: unit.toLowerCase() };
}
