import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { AnyAction, Reducer } from "redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Box } from "../Box";
import { Provider } from "store/reactZustand";
import { appReducers } from "reducers";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { State } from "state";
import { PokemonFixtures } from "utils/fixtures";

describe("Box", () => {
    it("deletes Pokémon inside a custom box when the box is deleted", () => {
        const defaultState = createDefaultState();
        const pokemonInCustomBox = {
            ...PokemonFixtures.Pikachu,
            id: "custom-box-pikachu",
            status: "Custom Box",
            position: 0,
        };
        const pokemonInTeam = {
            ...PokemonFixtures.Dragonite,
            id: "team-dragonite",
            status: "Team",
            position: 1,
        };
        const store = createReduxCompatibleZustandStore({
            initialState: {
                ...defaultState,
                box: [
                    ...defaultState.box,
                    {
                        id: 4,
                        position: 4,
                        name: "Custom Box",
                        background: "grass-meadow",
                    },
                ],
                pokemon: [pokemonInCustomBox, pokemonInTeam],
            },
            reducer: appReducers as unknown as Reducer<State, AnyAction>,
        });

        render(
            <Provider store={store}>
                <DndProvider backend={HTML5Backend}>
                    <Box
                        id={4}
                        position={4}
                        name="Custom Box"
                        background="grass-meadow"
                        pokemon={store.getState().pokemon}
                        searchTerm=""
                        matchedIds={new Set()}
                        hasSearchQuery={false}
                    />
                </DndProvider>
            </Provider>,
        );

        fireEvent.click(screen.getByText("Custom Box"));
        fireEvent.click(screen.getByText("Delete Box"));

        const dialog = screen.getByRole("alertdialog");
        fireEvent.click(
            within(dialog).getByRole("button", { name: "Delete Box" }),
        );

        expect(store.getState().box.some((entry) => entry.name === "Custom Box")).toBe(
            false,
        );
        expect(
            store.getState().pokemon.some((poke) => poke.id === "custom-box-pikachu"),
        ).toBe(false);
        expect(
            store.getState().pokemon.some((poke) => poke.id === "team-dragonite"),
        ).toBe(true);
    });
});
