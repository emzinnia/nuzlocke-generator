import * as React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { render, screen } from "@testing-library/react";

import { TrainerNotes } from "../TrainerNotes";
import { appReducers } from "reducers";
import { State } from "state";
import { styleDefaults } from "utils";

const createStoreWithState = (overrides: Partial<State> = {}) => {
    const base = appReducers(undefined, { type: "@@INIT" } as any) as State;
    return createStore(appReducers, {
        ...base,
        ...overrides,
        style: { ...base.style, ...(overrides.style ?? {}) },
        trainer: { ...base.trainer, ...(overrides.trainer ?? {}) },
    } as State);
};

describe("<TrainerNotes />", () => {
    it("renders trainer notes when present", () => {
        const store = createStoreWithState({
            style: styleDefaults,
            trainer: { notes: "Grind before gym." } as any,
        });

        render(
            <Provider store={store}>
                <TrainerNotes />
            </Provider>,
        );

        expect(screen.getByText("Grind before gym.")).toBeTruthy();
    });

    it("renders nothing when trainer has no notes", () => {
        const store = createStoreWithState({
            style: styleDefaults,
            trainer: { notes: "" } as any,
        });

        render(
            <Provider store={store}>
                <TrainerNotes />
            </Provider>,
        );

        expect(screen.queryByText("Grind before gym.")).toBeNull();
    });
});

