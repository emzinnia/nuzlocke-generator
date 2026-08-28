import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "utils/testUtils";
import { CurrentPokemonEditBase } from "../CurrentPokemonEdit";
import { Pokemon } from "models";
import { generateEmptyPokemon } from "utils";
import type { addPokemon, editPokemon, selectPokemon } from "actions";

const boxes = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
];

const editor = {
    minimized: false,
    temtemMode: false,
    showResultInMobile: false,
    monsterType: "Pokémon",
};

const createPokemon = (
    id: string,
    species: string,
    met = "Pallet Town",
): Pokemon => ({
    ...generateEmptyPokemon(),
    id,
    species,
    nickname: species,
    met,
    status: "Team",
});

const renderEditor = (
    selectedId: string,
    pokemon: Pokemon[],
    onEditPokemon: ReturnType<typeof vi.fn>,
) =>
    render(
        <CurrentPokemonEditBase
            selectedId={selectedId}
            box={boxes}
            pokemon={pokemon}
            selectPokemon={vi.fn() as unknown as selectPokemon}
            editPokemon={onEditPokemon as unknown as editPokemon}
            addPokemon={vi.fn() as unknown as addPokemon}
            game={{ name: "Red", customName: "" }}
            editor={editor}
            customTypes={[]}
            customAreas={[]}
        />,
    );

describe("<CurrentPokemonEdit />", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not apply a pending species edit to a newly selected Pokémon", async () => {
        vi.useFakeTimers();
        const pikachu = createPokemon("poke-a", "Pikachu");
        const bulbasaur = createPokemon("poke-b", "Bulbasaur");
        const onEditPokemon = vi.fn();

        const { rerender } = renderEditor(
            pikachu.id,
            [pikachu, bulbasaur],
            onEditPokemon,
        );

        const speciesInput = await screen.findByPlaceholderText("Missing No.");
        fireEvent.change(speciesInput, { target: { value: "Charizard" } });

        rerender(
            <CurrentPokemonEditBase
                selectedId={bulbasaur.id}
                box={boxes}
                pokemon={[pikachu, bulbasaur]}
                selectPokemon={vi.fn() as unknown as selectPokemon}
                editPokemon={onEditPokemon as unknown as editPokemon}
                addPokemon={vi.fn() as unknown as addPokemon}
                game={{ name: "Red", customName: "" }}
                editor={editor}
                customTypes={[]}
                customAreas={[]}
            />,
        );

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(onEditPokemon).not.toHaveBeenCalledWith(
            expect.objectContaining({ species: "Charizard" }),
            bulbasaur.id,
        );
        expect(onEditPokemon).not.toHaveBeenCalledWith(
            expect.objectContaining({ types: expect.anything() }),
            bulbasaur.id,
        );
    });

    it("does not apply a pending met-location edit to a newly selected Pokémon", async () => {
        vi.useFakeTimers();
        const pikachu = createPokemon("poke-a", "Pikachu", "Viridian Forest");
        const bulbasaur = createPokemon("poke-b", "Bulbasaur", "Route 1");
        const onEditPokemon = vi.fn();

        const { rerender } = renderEditor(
            pikachu.id,
            [pikachu, bulbasaur],
            onEditPokemon,
        );

        const metInput = await screen.findByPlaceholderText("Pallet Town");
        fireEvent.change(metInput, { target: { value: "Cerulean City" } });

        rerender(
            <CurrentPokemonEditBase
                selectedId={bulbasaur.id}
                box={boxes}
                pokemon={[pikachu, bulbasaur]}
                selectPokemon={vi.fn() as unknown as selectPokemon}
                editPokemon={onEditPokemon as unknown as editPokemon}
                addPokemon={vi.fn() as unknown as addPokemon}
                game={{ name: "Red", customName: "" }}
                editor={editor}
                customTypes={[]}
                customAreas={[]}
            />,
        );

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(onEditPokemon).not.toHaveBeenCalledWith(
            expect.objectContaining({ met: "Cerulean City" }),
            bulbasaur.id,
        );
    });
});
