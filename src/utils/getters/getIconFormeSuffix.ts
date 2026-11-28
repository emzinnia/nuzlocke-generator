import { Forme, normalizeFormeKey } from "../Forme";

export const getIconFormeSuffix = (
    forme?: keyof typeof Forme | Forme | string,
) => {
    const normalizedForme = normalizeFormeKey(forme) ?? forme;

    if (normalizedForme == null) return "";
    if (normalizedForme === "Normal") return "";
    if (normalizedForme === "Spring") return "";
    if (
        [
            "Heat",
            "Frost",
            "Fan",
            "Wash",
            "Mow",
            "Summer",
            "Winter",
            "Autumn",
        ].includes(normalizedForme)
    )
        return `-${normalizedForme.toLowerCase()}`;
    if (normalizedForme === "10%") return "-10-percent";
    if (normalizedForme === "Complete") return "-complete";
    if (normalizedForme === "!") return "-exclamation";
    if (normalizedForme === "?") return "-question";
    if (normalizedForme === "EternalFlower") return "-eternal";
    if (Forme[normalizedForme]) return `-${Forme[normalizedForme]}`;
    return "";
};
