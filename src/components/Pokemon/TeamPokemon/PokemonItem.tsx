import * as React from "react";
import { css, cx } from "emotion";
import { Pokemon } from "models";
import { State } from "state";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { getBackgroundGradient, typeToColor } from "utils";

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

export function PokemonItem({
    pokemon,
    style,
    customTypes,
}: {
    pokemon: Pokemon;
    style: State["style"];
    customTypes: State["customTypes"];
}) {
    const getSecondType = pokemon?.types?.[1] || "Normal";

    return (pokemon.item || pokemon.customItemImage) &&
        !style.displayItemAsText ? (
        <div
            style={{
                borderColor:
                    typeToColor(getSecondType, customTypes) || "transparent",
                backgroundImage:
                    style.template === "Hexagons" ||
                    style.itemStyle === "outer glow"
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
                itemLabelStyle[style.itemStyle],
                "pokemon-item",
            )}
        >
            {pokemon.customItemImage ? (
                <PokemonImage url={pokemon.customItemImage}>
                    {(image) => (
                        <img alt={pokemon.item} src={pokemon.customItemImage} />
                    )}
                </PokemonImage>
            ) : (
                <img
                    alt={pokemon.item}
                    src={`/icons/hold-item/${(pokemon.item || "")
                        .toLowerCase()
                        .replace(/'/g, "")
                        .replace(/\s/g, "-")}.png`}
                />
            )}
        </div>
    ) : null;
}
