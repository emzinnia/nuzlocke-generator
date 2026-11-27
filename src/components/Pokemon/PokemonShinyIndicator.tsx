import * as React from "react";
import { css } from "emotion";
import { Pokemon } from "models";

const shinyIndicatorStyle = css`
    display: inline-block;
    height: 1rem;
    margin-left: 0.25rem;
    vertical-align: -0.15rem;
    width: 1rem;
`;

export function PokemonShinyIndicator({
    shiny,
}: {
    shiny?: Pokemon["shiny"];
}) {
    if (!shiny) return null;

    return (
        <img
            alt="Shiny"
            className={`pokemon-shiny-indicator ${shinyIndicatorStyle}`}
            src="icons/key-item/shiny-charm.png"
            title="Shiny"
        />
    );
}
