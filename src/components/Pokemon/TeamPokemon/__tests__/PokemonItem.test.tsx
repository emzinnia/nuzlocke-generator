import * as React from "react";
import { render, screen } from "utils/testUtils";
import { Pokemon } from "models";
import { styleDefaults } from "utils/styleDefaults";
import { TemplateName, Types } from "utils";
import { PokemonItem } from "../PokemonItem";

const pokemon: Pokemon = {
    id: "poke-item-test",
    species: "Pikachu",
    item: "Leftovers",
    types: [Types.Electric, Types.Electric],
};

describe("PokemonItem", () => {
    it("lifts cards item icons above horizontal moves", () => {
        render(
            <PokemonItem
                pokemon={pokemon}
                style={{
                    ...styleDefaults,
                    template: TemplateName.Cards,
                    showPokemonMoves: true,
                    movesPosition: "horizontal",
                }}
                customTypes={[]}
            />,
        );

        const item = screen.getByAltText("Leftovers").parentElement;
        expect(item?.className).toContain(
            "pokemon-item--cards-with-horizontal-moves",
        );
    });

    it("keeps the default item position when cards moves are not horizontal", () => {
        render(
            <PokemonItem
                pokemon={pokemon}
                style={{
                    ...styleDefaults,
                    template: TemplateName.Cards,
                    showPokemonMoves: true,
                    movesPosition: "vertical",
                }}
                customTypes={[]}
            />,
        );

        const item = screen.getByAltText("Leftovers").parentElement;
        expect(item?.className).not.toContain(
            "pokemon-item--cards-with-horizontal-moves",
        );
    });

    it("keeps the default item position when cards moves are hidden", () => {
        render(
            <PokemonItem
                pokemon={pokemon}
                style={{
                    ...styleDefaults,
                    template: TemplateName.Cards,
                    showPokemonMoves: false,
                    movesPosition: "horizontal",
                }}
                customTypes={[]}
            />,
        );

        const item = screen.getByAltText("Leftovers").parentElement;
        expect(item?.className).not.toContain(
            "pokemon-item--cards-with-horizontal-moves",
        );
    });
});
