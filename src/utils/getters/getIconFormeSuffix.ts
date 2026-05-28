import { Forme } from "utils";

const formeSuffixOverrides: Record<string, string> = {
    Aria: "",
    Confined: "",
    Incarnate: "",
    Midday: "",
    Plant: "",
    Red: "",
    "Red-Striped": "",
    Solo: "",
    "Blue-Striped": "-blue-striped",
    "Burn Drive": "-fire",
    Chill: "-chill",
    "Chill Drive": "-ice",
    Dandy: "-dandy",
    Debutante: "-debutante",
    Diamond: "-diamond",
    "Douse Drive": "-water",
    Dusk: "-dusk",
    "Eternal Flower": "-eternal",
    Heart: "-heart",
    Kabuki: "-kabuki",
    "La Reine": "-la-reine",
    Libre: "-libre",
    Matron: "-matron",
    Midnight: "-midnight",
    Orange: "-orange",
    Pharaoh: "-pharaoh",
    "Ph. D": "-phd",
    "Pop Star": "-pop-star",
    Primal: "-primal",
    "Rock Star": "-rock-star",
    "Shock Drive": "-electric",
    "Spiky-eared": "-spiky-eared",
    Star: "-star",
    White: "-white",
    "White-Striped": "-white-striped",
    Yellow: "-yellow",
    Belle: "-belle",
    Blue: "-blue",
    "Alola Cap": "-alola-cap",
    "Hoenn Cap": "-hoenn-cap",
    "Kalos Cap": "-kalos-cap",
    "Original Cap": "-original-cap",
    "Partner Cap": "-partner-cap",
    "Sinnoh Cap": "-sinnoh-cap",
    "Unova Cap": "-unova-cap",
};

export const getIconFormeSuffix = (forme: keyof typeof Forme) => {
    console.log(forme);
    if (forme == null) return "";
    if (forme === "Normal") return "";
    if (formeSuffixOverrides[forme] != null) return formeSuffixOverrides[forme];
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
