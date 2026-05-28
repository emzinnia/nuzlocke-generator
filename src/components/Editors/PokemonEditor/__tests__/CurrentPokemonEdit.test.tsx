import * as React from "react";
import type { AnyAction, Reducer } from "redux";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import { Provider } from "store/reactZustand";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { appReducers } from "reducers";
import { generateEmptyPokemon } from "utils";
import { State } from "state";
import { CurrentPokemonEditBase, CurrentPokemonEditProps } from "..";

vi.mock("components/Common/Shared/ImagesDrawer", () => ({
    getImages: vi.fn().mockResolvedValue([]),
}));

vi.mock("components/Common/Shared/DexieImagePickerPopover", () => ({
    DexieImagePickerPopover: () => null,
}));

const defaultBoxes = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

const customBox = {
    id: 4,
    position: 4,
    name: "Armory",
    background: "seafloor",
    inheritFrom: "Team",
};

const getStatusOptions = (container: HTMLElement) => {
    const statusSelect = container.querySelector<HTMLSelectElement>(
        'select[name="status"]',
    );

    return Array.from(statusSelect?.options ?? []).map((option) => option.value);
};

describe("<CurrentPokemonEdit />", () => {
    it("updates the status dropdown when custom boxes are added after mount", () => {
        const defaultState = createDefaultState();
        const pokemon = generateEmptyPokemon([], {
            id: "voltorb-1",
            species: "Voltorb",
            status: "Team",
        });
        const store = createReduxCompatibleZustandStore({
            initialState: {
                ...defaultState,
                selectedId: pokemon.id,
                pokemon: [pokemon],
                box: defaultBoxes,
            },
            reducer: appReducers as unknown as Reducer<State, AnyAction>,
        });
        const props: CurrentPokemonEditProps = {
            selectedId: pokemon.id,
            box: defaultBoxes,
            pokemon: [pokemon],
            selectPokemon: vi.fn(),
            editPokemon: vi.fn(),
            addPokemon: vi.fn(),
            game: defaultState.game,
            editor: defaultState.editor,
            customTypes: defaultState.customTypes,
            customAreas: defaultState.customAreas,
        };
        const renderEditor = (box: CurrentPokemonEditProps["box"]) => (
            <Provider store={store}>
                <CurrentPokemonEditBase {...props} box={box} />
            </Provider>
        );

        const { container, rerender } = render(renderEditor(defaultBoxes));

        expect(getStatusOptions(container)).toEqual([
            "Team",
            "Boxed",
            "Dead",
            "Champs",
        ]);

        rerender(renderEditor([...defaultBoxes, customBox]));

        expect(getStatusOptions(container)).toEqual([
            "Team",
            "Boxed",
            "Dead",
            "Champs",
            "Armory",
        ]);
    });
});
