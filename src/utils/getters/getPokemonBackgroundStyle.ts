import { Pokemon } from "models";
import { State } from "state";
import { Game } from "../data/listOfGames";
import { gameOfOriginToColor } from "../formatters/gameOfOriginToColor";
import { PokemonBackgroundSource, Styles } from "../styleDefaults";
import { Types } from "../Types";
import { typeToColor } from "../typeToColor";
import { getBackgroundGradient } from "./getBackgroundGradient";
import { getContrastColor } from "./getContrastColor";

export interface PokemonBackgroundStyle {
    background: string;
    color: string;
    source: PokemonBackgroundSource;
    usesGameOriginBackground: boolean;
}

const getBackgroundSource = (style: Styles): PokemonBackgroundSource => {
    if (style.pokemonBackgroundSource) {
        return style.pokemonBackgroundSource;
    }

    return style.displayGameOriginForBoxedAndDead &&
        style.displayBackgroundInsteadOfBadge
        ? "game-origin"
        : "accent";
};

const getAccentColor = (style: Styles | undefined, fallback: string) =>
    style?.accentColor || fallback;

export const getPokemonBackgroundStyle = ({
    accentFallback = "#111111",
    customTypes,
    pokemon,
    style,
}: {
    accentFallback?: string;
    customTypes?: State["customTypes"];
    pokemon: Pick<Pokemon, "gameOfOrigin" | "types">;
    style: Styles;
}): PokemonBackgroundStyle => {
    const source = getBackgroundSource(style);
    const accentColor = getAccentColor(style, accentFallback);

    if (source === "type" && pokemon.types?.[0]) {
        const primaryType = pokemon.types[0] as keyof typeof Types;
        const secondaryType = (pokemon.types[1] ?? pokemon.types[0]) as keyof typeof Types;
        const primaryTypeColor = typeToColor(primaryType, customTypes) || accentColor;

        return {
            background: getBackgroundGradient(primaryType, secondaryType, customTypes ?? []),
            color: getContrastColor(primaryTypeColor),
            source,
            usesGameOriginBackground: false,
        };
    }

    if (source === "game-origin" && pokemon.gameOfOrigin) {
        const gameOriginColor = gameOfOriginToColor(pokemon.gameOfOrigin as Game);

        if (gameOriginColor) {
            return {
                background: gameOriginColor,
                color: getContrastColor(gameOriginColor),
                source,
                usesGameOriginBackground: true,
            };
        }
    }

    return {
        background: accentColor,
        color: getContrastColor(accentColor),
        source: "accent",
        usesGameOriginBackground: false,
    };
};
