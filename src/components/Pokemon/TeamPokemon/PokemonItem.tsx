import * as React from "react";
import { css, cx } from "emotion";
import { Pokemon } from "models";
import { State } from "state";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { ResizedImage } from "components/Common/Shared/ResizedImage";
import { getBackgroundGradient, getHeldItemIconPath, typeToColor } from "utils";

const DEFAULT_CUSTOM_ITEM_IMAGE_SCALE = 100;
const MIN_CUSTOM_ITEM_IMAGE_SCALE = 1;
const MAX_CUSTOM_ITEM_IMAGE_SCALE = 200;

export function getCustomItemImageScale(
    scale: Pokemon["customItemImageScale"],
) {
    if (scale == null || scale === "") return DEFAULT_CUSTOM_ITEM_IMAGE_SCALE;

    const numericScale = Number(scale);
    if (!Number.isFinite(numericScale)) return DEFAULT_CUSTOM_ITEM_IMAGE_SCALE;

    return Math.min(
        MAX_CUSTOM_ITEM_IMAGE_SCALE,
        Math.max(MIN_CUSTOM_ITEM_IMAGE_SCALE, numericScale),
    );
}

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
    const customItemImageScale = `${getCustomItemImageScale(
        pokemon.customItemImageScale,
    )}%`;

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
                        <ResizedImage
                            // Cap custom item image data at 64x64 for consistent rendering/export.
                            src={image}
                            width={64}
                            height={64}
                            alt={pokemon.item}
                            style={{
                                width: customItemImageScale,
                                height: customItemImageScale,
                                objectFit: "contain",
                            }}
                        />
                    )}
                </PokemonImage>
            ) : (
                <img
                    alt={pokemon.item}
                    src={getHeldItemIconPath(pokemon.item || "")}
                />
            )}
        </div>
    ) : null;
}
