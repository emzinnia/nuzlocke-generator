import * as React from "react";
import { vi } from "vitest";

vi.mock("components/Pokemon/PokemonIcon", () => ({
    PokemonIcon: ({ species }: { species: string }) => (
        <div data-testid="pokemon-icon">{species}</div>
    ),
}));

import { fireEvent, render, screen } from "utils/testUtils";
import { PokemonByFilterBase } from "../PokemonByFilter";
import { Types } from "utils";
import type { Pokemon } from "models";

const basePokemon: Pokemon = {
    id: "poke-1",
    species: "Pikachu",
    nickname: "Sparky",
    level: "9" as unknown as number,
    status: "Team",
    types: [Types.Electric, Types.Electric],
};

const renderPokemonByFilter = (
    pokemon: Pokemon[],
    editPokemon = vi.fn(),
) => {
    render(
        <PokemonByFilterBase
            team={pokemon}
            status="Team"
            editPokemon={editPokemon}
            searchTerm=""
            matchedIds={new Set()}
            hasSearchQuery={false}
            isDarkMode={false}
            selectedId=""
        />,
    );

    return editPokemon;
};

describe(PokemonByFilterBase.name, () => {
    it("adds a level-up button next to each pokemon icon", () => {
        renderPokemonByFilter([basePokemon]);

        expect(screen.getByTestId("pokemon-icon").textContent).toBe("Pikachu");
        expect(
            screen.getByRole("button", { name: "Level up Sparky" }),
        ).toBeTruthy();
    });

    it("increments the selected pokemon level from the box list", () => {
        const editPokemon = renderPokemonByFilter([basePokemon]);

        fireEvent.click(screen.getByRole("button", { name: "Level up Sparky" }));

        expect(editPokemon).toHaveBeenCalledWith({ level: 10 }, "poke-1");
    });

    it("starts at level 1 when the pokemon has no level yet", () => {
        const editPokemon = renderPokemonByFilter([
            {
                ...basePokemon,
                level: undefined,
            },
        ]);

        fireEvent.click(screen.getByRole("button", { name: "Level up Sparky" }));

        expect(editPokemon).toHaveBeenCalledWith({ level: 1 }, "poke-1");
    });
});
