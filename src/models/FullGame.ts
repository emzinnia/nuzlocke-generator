import { Pokemon } from "./Pokemon";

enum EncounterMethod {
    Grass = "Grass",
    TallGrass = "Tall Grass",
    Surf = "Surf",
    Fishing = "Fishing",
    RockSmash = "Rock Smash",
    Headbutt = "Headbutt",
    SweetScent = "Sweet Scent",
    Dive = "Dive",
}

/**
 * A full game is considered a game with all its features and data.
 */
export interface FullGame {
    id: string;
    name: string;
    isRomHack?: boolean;
    isADifficultyHack?: boolean;
    routes: {
        id: string;
        routeName: string;
        pokemonMap: {
            Pokemon: Pokemon & { levelRange: [number, number] },
            method: EncounterMethod;
        }[];
    }
}