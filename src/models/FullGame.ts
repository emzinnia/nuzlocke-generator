import { Badge } from "./Badge";
import { Pokemon } from "./Pokemon";

export enum EncounterMethod {
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
            id: string;
            species: string;
            levelRange: [number, number];
            method: EncounterMethod;
        }[];
    }[];
    bosses: {
        name: string;
        id: string;
        badge?: Badge;
        pokemon: (Partial<Pokemon> & { starter?: boolean })[];
    }[];
    trainerRoutesOrders: string[];
}