import { Forme } from "utils";

export const getIconFormeSuffix = (forme: keyof typeof Forme) => {
    if (forme == null) return "";
    if (forme === "Normal") return "";
    if (forme === "Spring") return "";
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
        ].includes(forme)
    )
        return `-${forme.toLowerCase()}`;
    if (forme === "10%") return "-10-percent";
    if (forme === "Complete") return "-complete";
    if (forme === "!") return "-exclamation";
    if (forme === "?") return "-question";
    if (forme === "EternalFlower") return "-eternal";
    if (Forme[forme]) return `-${Forme[forme]}`;
    return "";
};
