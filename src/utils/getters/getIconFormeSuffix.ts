import { Forme } from "utils";

type FormeKey = keyof typeof Forme;

const getFormeKey = (forme: FormeKey | Forme): FormeKey | undefined =>
    (Object.entries(Forme) as Array<[FormeKey, Forme]>).find(
        ([key, value]) => key === forme || value === forme,
    )?.[0];

export const getIconFormeSuffix = (forme?: FormeKey | Forme) => {
    if (forme == null) return "";
    const formeKey = getFormeKey(forme) ?? forme;
    if (formeKey === "Normal") return "";
    if (formeKey === "Spring") return "";
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
        ].includes(formeKey)
    )
        return `-${formeKey.toLowerCase()}`;
    if (formeKey === "10%") return "-10-percent";
    if (formeKey === "Complete") return "-complete";
    if (formeKey === "!") return "-exclamation";
    if (formeKey === "?") return "-question";
    if (formeKey === "EternalFlower") return "-eternal";
    if (Forme[formeKey]) return `-${Forme[formeKey]}`;
    return "";
};
