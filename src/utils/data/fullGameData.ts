import { FullGame } from "models/FullGame";

export const fullGameData: FullGame = {
    id: crypto.randomUUID(),
    name: "Red Version",
    routes: [
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