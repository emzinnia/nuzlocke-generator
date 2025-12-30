import * as React from "react";
import { css, cx } from "emotion";
import { Pokemon } from "models";
import { State } from "state";
import {
    formatBallText,
    getBackgroundGradient,
    normalizePokeballName,
    typeToColor,
} from "utils";

const itemLabelStyle = {
    base: css`
        background: #111;
        border: 5px solid white;
        bottom: 0;
        height: 3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 12px;
        padding: 0.5rem;
        position: absolute;
        width: 3rem;
        z-index: 10;
    `,
    ["round"]: css`
        border-radius: 50%;
    `,
    ["square"]: css`
        border-radius: 0;
    `,
    ["outer glow"]: css`
        background: transparent !important;
        border: none !important;
        filter: drop-shadow(0 0 2px white);
        padding: 0;
        margin: 0;
        bottom: 0.5rem;
    `,
    ["text"]: css`
        display: none !important;
    `,
};

export function PokemonPokeball({
    pokemon,
    style,
    customTypes,
}: {
    pokemon: Pokemon;
    style: State["style"];
    customTypes: State["customTypes"];
}) {
    const getFirstType = pokemon?.types?.[0] || "Normal";

    return pokemon.pokeball && pokemon.pokeball !== "None" ? (
        <div
            style={{
                top: style.template === "Cards" ? "1rem" : undefined,
                left: "6rem",
                zIndex: 10,
                borderColor:
                    typeToColor(getFirstType, customTypes) || "transparent",
                backgroundImage:
                    style.template === "Hexagons" ||
                    style.pokeballStyle === "outer glow"
                        ? getBackgroundGradient(
                              pokemon.types != null
                                  ? pokemon.types[0]
                                  : "Normal",
                              pokemon.types != null
                                  ? pokemon.types[1]
                                  : "Normal",
                              customTypes,
                          )
                        : "",
            }}
            className={cx(
                itemLabelStyle.base,
                itemLabelStyle[style.pokeballStyle],
                "pokemon-pokeball",
            )}
        >
            <img
                alt={normalizePokeballName(pokemon.pokeball)}
                src={`icons/pokeball/${formatBallText(pokemon.pokeball)}.png`}
            />
        </div>
    ) : null;
}
