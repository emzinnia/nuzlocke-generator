import * as React from "react";
import { diff } from "deep-diff";
import { fireEvent, render } from "utils/testUtils";
import { Provider } from "store/reactZustand";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { appReducers } from "reducers";
import { EditorControls } from "../EditorControls";
import { DiffEntry, HistoryEntry } from "reducers/editorHistory";
import { State } from "state";
import type { AnyAction, Reducer } from "redux";

const createHistoryEntry = (previousState: State, nextState: State): HistoryEntry => ({
    forwardDiff: diff(previousState, nextState) as DiffEntry,
    backwardDiff: diff(nextState, previousState) as DiffEntry,
});

const renderWithHistory = () => {
    const defaultState = createDefaultState();
    const previousState: State = {
        ...defaultState,
        trainer: { ...defaultState.trainer, name: "Before undo" },
    };
    const presentState: State = {
        ...defaultState,
        trainer: { ...defaultState.trainer, name: "Current" },
    };
    const nextState: State = {
        ...defaultState,
        trainer: { ...defaultState.trainer, name: "After redo" },
    };
    const store = createReduxCompatibleZustandStore({
        initialState: {
            ...presentState,
            editorHistory: {
                past: [createHistoryEntry(previousState, presentState)],
                present: presentState,
                future: [createHistoryEntry(presentState, nextState)],
                lastRevisionType: "update",
            },
        },
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });

    render(
        <Provider store={store}>
            <EditorControls editorDarkMode={false} minimized={false} />
        </Provider>,
    );

    return store;
};

describe("<EditorControls />", () => {
    it("only undoes on Ctrl+Z when redo is also available", () => {
        const store = renderWithHistory();

        fireEvent.keyDown(window, { key: "z", ctrlKey: true });

        expect(store.getState().trainer.name).toBe("Before undo");
    });

    it("redoes on Ctrl+Shift+Z", () => {
        const store = renderWithHistory();

        fireEvent.keyDown(window, { key: "Z", ctrlKey: true, shiftKey: true });

        expect(store.getState().trainer.name).toBe("After redo");
    });
});
