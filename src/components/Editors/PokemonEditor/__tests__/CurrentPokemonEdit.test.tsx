import * as React from "react";
import { fireEvent, render, screen, waitFor } from "utils/testUtils";
import { vi } from "vitest";
import { CurrentPokemonEditBase } from "../CurrentPokemonEdit";

describe("<CurrentPokemonEdit />", () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    it("allows the met location to be cleared", async () => {
        const editPokemon = vi.fn();
        const selectPokemon = vi.fn();
        const selectedId = "pokemon-1";

        render(
            <CurrentPokemonEditBase
                selectedId={selectedId}
                box={[]}
                pokemon={[
                    {
                        id: selectedId,
                        species: "Bulbasaur",
                        met: "Pallet Town",
                        level: 5,
                    },
                ]}
                selectPokemon={selectPokemon}
                editPokemon={editPokemon}
                addPokemon={vi.fn()}
                game={{ name: "Red", customName: "" }}
                editor={{ minimized: false }}
                customTypes={[]}
                customAreas={[]}
            />,
        );

        const metLocationInput = screen
            .getAllByTestId("autocomplete")
            .find((input) => input.getAttribute("name") === "met");

        expect(metLocationInput).toBeDefined();

        fireEvent.change(metLocationInput!, { target: { value: "" } });

        await waitFor(() => {
            expect(editPokemon).toHaveBeenCalledWith({ met: "" }, selectedId);
        });
        expect(selectPokemon).toHaveBeenCalledWith(selectedId);
    });
});
