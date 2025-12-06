import { FullGame } from "models/FullGame";
import { EncounterMethod } from "models/FullGame";

export const fullGameData: FullGame = {
    id: crypto.randomUUID(),
    name: "Red Version",
    routes: [
        {
            id: "0",
            routeName: "Pallet Town",
            pokemonMap: [
                {
                    id: "1",
                    species: "Goldeen",
                    levelRange: [1, 10],
                    method: EncounterMethod.Fishing,
                },
                {
                    id: "2",
                    species: "Magikarp",
                    levelRange: [1, 10],
                    method: EncounterMethod.Fishing,
                },
                {
                    id: "3",
                    species: "Poliwag",
                    levelRange: [1, 10],
                    method: EncounterMethod.Fishing,
                },
                {
                    id: "4",
                    species: "Tentacool",
                    levelRange: [1, 10],
                    method: EncounterMethod.Surf,
                },
            ],
        },
        {
            id: "1",
            routeName: "Route 1",
            pokemonMap: [],
        },
        {
            id: "2",
            routeName: "Route 2",
            pokemonMap: [
                {
                    id: "5",
                    species: "Rattata",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
        {
            id: "3",
            routeName: "Route 3",
            pokemonMap: [
                {
                    id: "6",
                    species: "Spearow",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
        {
            id: "4",
            routeName: "Route 4",
            pokemonMap: [
                {
                    id: "7",
                    species: "Fearow",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
        {
            id: "5",
            routeName: "Route 5",
            pokemonMap: [
                {
                    id: "8",
                    species: "Ekans",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
        {
            id: "6",
            routeName: "Route 6",
            pokemonMap: [
                {
                    id: "9",
                    species: "Arbok",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
        {
            id: "7",
            routeName: "Route 7",
            pokemonMap: [
                {
                    id: "10",
                    species: "Pidgeot",
                    levelRange: [1, 10],
                    method: EncounterMethod.Grass,
                },
            ],
        },
    ],
    keyTrainers: [
        {
            name: "Rival",
            id: "1",
            pokemon: [
                {
                    level: 5,
                    starter: true,
                    species: "Charmander",
                }
            ],
        },
        {
            name: "Rival",
            id: "2",
            pokemon: [
                {
                    level: 9,
                    species: "Pidgey",
                },
                {
                    level: 8,
                    starter: true,
                    species: "Charmander",
                }
            ],
        },
    ],
    trainerRoutesOrders: [],
};
