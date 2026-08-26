import * as React from "react";
import type { AnyAction, Reducer } from "redux";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { appReducers } from "reducers";
import { State } from "state";
import { createDefaultState } from "store";
import { Provider } from "store/reactZustand";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { generateEmptyPokemon } from "utils";

import { CurrentPokemonInput } from "../CurrentPokemonInput";

const renderMoveInput = () => {
    const defaultState = createDefaultState();
    const pokemon = {
        ...generateEmptyPokemon(),
        id: "pokemon-1",
        moves: [],
        species: "Zebstrika",
    };
    const store = createReduxCompatibleZustandStore({
        initialState: {
            ...defaultState,
            pokemon: [pokemon],
            selectedId: pokemon.id,
        },
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });

    const view = render(
        <Provider store={store}>
            <CurrentPokemonInput
                inputName="moves"
                key="moves"
                labelName="Moves"
                type="moves"
                value={pokemon.moves}
            />
        </Provider>,
    );

    const input = view.container.querySelector(".bp5-tag-input input");
    if (!(input instanceof HTMLInputElement)) {
        throw new Error("Move input did not render a text input");
    }

    return { input, store, view };
};

describe(CurrentPokemonInput.name, () => {
    it("adds an exact move when Enter is pressed", () => {
        const { input, store } = renderMoveInput();

        fireEvent.change(input, { target: { value: "Thunderbolt" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(store.getState().pokemon[0].moves).toEqual(["Thunderbolt"]);
    });

    it("shows move suggestions and adds the tapped move", () => {
        const { input, store } = renderMoveInput();

        fireEvent.change(input, { target: { value: "Thunderbol" } });
        const suggestion = screen.getByRole("option", { name: "Thunderbolt" });

        fireEvent.mouseDown(suggestion);

        expect(store.getState().pokemon[0].moves).toEqual(["Thunderbolt"]);
    });
});
