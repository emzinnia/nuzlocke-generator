import { Game } from "utils";

export const gameOfOriginToColor = (game: Game) => {
    type GameToColor = { [G in Game]?: string };

    const gameToColor: GameToColor = {
        Red: "rgb(243, 86, 58)",
        Blue: "#3675f8",
        Yellow: "#fdd33c",
        Green: "#03c242",
        Gold: "#E6BE8A",
        Silver: "#d8d8d8",
        Crystal: "#98bbcd",
        Ruby: "#bc1a1a",
        Sapphire: "#1a3abc",
        Emerald: "#1abc58",
        FireRed: "#ef4e21",
        LeafGreen: "#46f279",
        Diamond: "#7ebffc",
        Pearl: "#ffa8bb",
        Platinum: "#c6b1b1",
        HeartGold: "#c9c782",
        SoulSilver: "#c5d3db",
        Black: "#090d0f",
        "Black 2": "#061b26",
        White: "#f9f9f9",
        "White 2": "#f2e8e8",
        Y: "#963934",
        X: "#5bb7b3",
        OmegaRuby: "#a53131",
        AlphaSapphire: "#3161a5",
        Sun: "#ed8d17",
        Moon: "#ac17ed",
        "Ultra Sun": "#e29b1f",
        "Ultra Moon": "#ac17ed",
        Colosseum: "#dfe0d2",
        "XD Gale of Darkness": "#39104f",
        "Let's Go Eevee": "#d1b28c",
        "Let's Go Pikachu": "#ede087",
        Sword: "#48A9A6",
        Shield: "#C1474D",
        "Brilliant Diamond": "#408ed6",
        "Shining Pearl": "#ed5880",
        "Legends: Arceus": "#87c196",
        Scarlet: "#e54310",
        Violet: "#491a6a",
        "Legends: Z-A": "#81c2a5",
    };

    return gameToColor[game] || "";
};
