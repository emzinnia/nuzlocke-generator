import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "utils/testUtils";
import { Forme } from "utils";
import {
    EvolutionSelection,
    getEvolutionOptions,
} from "../CurrentPokemonEdit";

describe(getEvolutionOptions.name, () => {
    it("maps Alolan Meowth to Alolan Persian", () => {
        const options = getEvolutionOptions({
            species: "Meowth",
            forme: "Alolan",
        });

        expect(options).toEqual([{ species: "Persian", forme: "Alolan" }]);
    });

    it("maps enum-valued Alolan Meowth to Alolan Persian", () => {
        const options = getEvolutionOptions({
            species: "Meowth",
            forme: Forme.Alolan,
        });

        expect(options).toEqual([{ species: "Persian", forme: "Alolan" }]);
    });

    it("maps Galarian Meowth to Perrserker without a regional forme", () => {
        const options = getEvolutionOptions({
            species: "Meowth",
            forme: "Galarian",
        });

        expect(options).toEqual([{ species: "Perrserker", forme: "Normal" }]);
    });

    it("maps regular Meowth to regular Persian", () => {
        const options = getEvolutionOptions({
            species: "Meowth",
            forme: "Normal",
        });

        expect(options).toEqual([{ species: "Persian", forme: "Normal" }]);
    });
});

describe(EvolutionSelection.name, () => {
    it("evolves Alolan Meowth into Alolan Persian", () => {
        const handleEvolve = vi.fn(() => vi.fn());

        render(
            <EvolutionSelection
                currentPokemon={{ species: "Meowth", forme: "Alolan" }}
                onEvolve={handleEvolve}
            />,
        );

        fireEvent.click(screen.getByText("Evolve"));

        expect(handleEvolve).toHaveBeenCalledWith("Persian", "Alolan");
    });

    it("evolves Galarian Meowth into regular Perrserker", () => {
        const handleEvolve = vi.fn(() => vi.fn());

        render(
            <EvolutionSelection
                currentPokemon={{ species: "Meowth", forme: "Galarian" }}
                onEvolve={handleEvolve}
            />,
        );

        fireEvent.click(screen.getByText("Evolve"));

        expect(handleEvolve).toHaveBeenCalledWith("Perrserker", "Normal");
    });
});
