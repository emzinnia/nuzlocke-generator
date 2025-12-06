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
    ],
    keyTrainers: [
        {
            name: "Red",
            id: "1",
            time: "04:33",
            badge: { name: "Boulder Badge", image: "boulder-badge" },
            pokemon: [],
        },
    ],
    trainerRoutesOrders: [],
};
