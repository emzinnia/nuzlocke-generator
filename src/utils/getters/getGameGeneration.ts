import { Game } from "../data/listOfGames";

export enum Generation {
    Gen1 = 1,
    Gen2,
    Gen3,
    Gen4,
    Gen5,
    Gen6,
    Gen7,
    Gen8,
    Gen9,
}

export const getGameGeneration = (game: Game): Generation => {
    const Gen1: Game[] = ["Red", "Blue", "Yellow", "Green"];
    const Gen2: Game[] = ["Gold", "Silver", "Crystal"];
    const Gen3: Game[] = [
        "Ruby",
        "Sapphire",
        "Emerald",
        "FireRed",
        "LeafGreen",
        "Colosseum",
        "XD Gale of Darkness",
    ];
    const Gen4: Game[] = [
        "Diamond",
        "Pearl",
        "Platinum",
        "HeartGold",
        "SoulSilver",
    ];
    const Gen5: Game[] = ["Black", "Black 2", "White", "White 2"];
    const Gen6: Game[] = ["X", "Y", "OmegaRuby", "AlphaSapphire"];
    const Gen7: Game[] = [
        "None",
        "Sun",
        "Moon",
        "Ultra Moon",
        "Ultra Sun",
        "Let's Go Eevee",
        "Let's Go Pikachu",
    ];
    const Gen8: Game[] = [
        "Sword",
        "Shield",
        "Brilliant Diamond",
        "Shining Pearl",
        "Legends: Arceus",
    ];
    const Gen9: Game[] = ["Scarlet", "Violet", "Legends: Z-A"];

    if (Gen1.includes(game)) return Generation.Gen1;
    if (Gen2.includes(game)) return Generation.Gen2;
    if (Gen3.includes(game)) return Generation.Gen3;
    if (Gen4.includes(game)) return Generation.Gen4;
    if (Gen5.includes(game)) return Generation.Gen5;
    if (Gen6.includes(game)) return Generation.Gen6;
    if (Gen7.includes(game)) return Generation.Gen7;
    if (Gen8.includes(game)) return Generation.Gen8;
    if (Gen9.includes(game)) return Generation.Gen9;

    return Generation.Gen8;
};
