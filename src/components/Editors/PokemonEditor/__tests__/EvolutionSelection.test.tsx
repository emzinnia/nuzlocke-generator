import * as React from "react";
import { vi } from "vitest";
import { fireEvent, render, screen } from "utils/testUtils";
import { EvolutionSelection } from "../CurrentPokemonEdit";
import { Types } from "utils";
import type { Pokemon } from "models";

const createPokemon = (species: string): Pokemon => ({
    id: "poke-1",
    species,
    status: "Team",
    types: [Types.Normal, Types.Normal],
});

describe(EvolutionSelection.name, () => {
    it("renders a direct evolve button for pokemon with one evolution", () => {
        const onEvolve = vi.fn(() => vi.fn());

        render(
            <EvolutionSelection
                currentPokemon={createPokemon("Bulbasaur")}
                onEvolve={onEvolve}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Evolve Bulbasaur to Ivysaur",
            }),
        );

        expect(onEvolve).toHaveBeenCalledWith("Ivysaur");
    });

    it("renders a choice button for pokemon with multiple evolutions", () => {
        render(
            <EvolutionSelection
                currentPokemon={createPokemon("Eevee")}
                onEvolve={vi.fn(() => vi.fn())}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Choose evolution for Eevee" }),
        ).toBeTruthy();
    });

    it("does not render for pokemon without evolutions", () => {
        const { container } = render(
            <EvolutionSelection
                currentPokemon={createPokemon("Mew")}
                onEvolve={vi.fn(() => vi.fn())}
            />,
        );

        expect(container.textContent).toBe("");
    });
});
