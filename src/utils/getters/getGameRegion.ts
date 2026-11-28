import { Game } from "utils";

export enum Region {
    Kanto = "kanto",
    Johto = "johto",
    Hoenn = "hoenn",
    Sinnoh = "sinnoh",
    Unova = "unova",
    Kalos = "kalos",
    Alola = "alola",
    Orre = "orre",
    Galar = "galar",
    Hisui = "hisui",
    Paldea = "Paldea",
    LumioseCity = "LumioseCity",
    Other = "other",
}

export const getGameRegion = (game: Game): Region => {
    const kanto: Game[] = [
        "Red",
        "Blue",
        "Yellow",
        "Green",
        "FireRed",
        "LeafGreen",
        "Let's Go Eevee",
        "Let's Go Pikachu",
    ];
    const johto: Game[] = [
        "Gold",
        "Silver",
        "Crystal",
        "HeartGold",
        "SoulSilver",
    ];
    const hoenn: Game[] = [
        "Ruby",
        "Sapphire",
        "OmegaRuby",
        "AlphaSapphire",
        "Emerald",
    ];
    const sinnoh: Game[] = [
        "Diamond",
        "Pearl",
        "Platinum",
        "Brilliant Diamond",
        "Shining Pearl",
    ];
    const unova: Game[] = ["Black", "Black 2", "White", "White 2"];
    const kalos: Game[] = ["X", "Y"];
    const alola: Game[] = ["Sun", "Ultra Sun", "Ultra Moon", "Moon"];
    const orre: Game[] = ["XD Gale of Darkness", "Colosseum"];
    const galar: Game[] = ["Sword", "Shield"];
    const hisui: Game[] = ["Legends: Arceus"];
    const paldea: Game[] = ["Scarlet", "Violet"];
    const lumiose: Game[] = ["Legends: Z-A"];

    if (kanto.includes(game)) return Region.Kanto;
    if (johto.includes(game)) return Region.Johto;
    if (hoenn.includes(game)) return Region.Hoenn;
    if (sinnoh.includes(game)) return Region.Sinnoh;
    if (unova.includes(game)) return Region.Unova;
    if (kalos.includes(game)) return Region.Kalos;
    if (alola.includes(game)) return Region.Alola;
    if (orre.includes(game)) return Region.Orre;
    if (galar.includes(game)) return Region.Galar;
    if (hisui.includes(game)) return Region.Hisui;
    if (paldea.includes(game)) return Region.Paldea;
    if (lumiose.includes(game)) return Region.LumioseCity;

    return Region.Other;
};
