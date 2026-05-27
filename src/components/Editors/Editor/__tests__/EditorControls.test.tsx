import * as React from "react";
import { fireEvent, render } from "@testing-library/react";
import { diff } from "deep-diff";
import type { AnyAction, Reducer } from "redux";
import { Provider } from "store/reactZustand";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { createDefaultState } from "store";
import { appReducers } from "reducers";
import { DiffEntry, HistoryEntry } from "reducers/editorHistory";
import { State } from "state";
import {
    EditorControls,
    isRedoShortcut,
    isUndoShortcut,
} from "../EditorControls";

type TrackableState = Omit<State, "editorHistory">;

const withoutEditorHistory = (state: State): TrackableState => {
    const { editorHistory: _editorHistory, ...trackableState } = state;
    return trackableState;
};

const createHistoryEntry = (
    previousState: TrackableState,
    nextState: TrackableState,
): HistoryEntry => ({
    forwardDiff: (diff(previousState, nextState) ?? []) as DiffEntry,
    backwardDiff: (diff(nextState, previousState) ?? []) as DiffEntry,
});

const createTrackableState = (
    defaultState: State,
    nickname: string,
): TrackableState =>
    withoutEditorHistory({
        ...defaultState,
        pokemon: [
            {
                ...defaultState.pokemon[0],
                id: "shortcut-test-pokemon",
                nickname,
            },
        ],
    });

const createStoreWithUndoAndRedoHistory = () => {
    const defaultState = createDefaultState();
    const firstState = createTrackableState(defaultState, "First");
    const secondState = createTrackableState(defaultState, "Second");
    const thirdState = createTrackableState(defaultState, "Third");
    const firstToSecond = createHistoryEntry(firstState, secondState);
    const secondToThird = createHistoryEntry(secondState, thirdState);

    return createReduxCompatibleZustandStore({
        initialState: {
            ...secondState,
            editorHistory: {
                past: [firstToSecond],
                present: secondState,
                future: [secondToThird],
                lastRevisionType: "undo",
            },
        } as State,
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });
};

describe("EditorControls keyboard shortcuts", () => {
    it("treats Ctrl+Z as undo and Ctrl+Shift+Z as redo", () => {
        expect(
            isUndoShortcut(
                new KeyboardEvent("keydown", { ctrlKey: true, key: "z" }),
            ),
        ).toBe(true);
        expect(
            isRedoShortcut(
                new KeyboardEvent("keydown", {
                    ctrlKey: true,
                    key: "Z",
                    shiftKey: true,
                }),
            ),
        ).toBe(true);
        expect(
            isRedoShortcut(
                new KeyboardEvent("keydown", { ctrlKey: true, key: "z" }),
            ),
        ).toBe(false);
    });

    it("does not immediately redo a keyboard undo when redo history exists", () => {
        const store = createStoreWithUndoAndRedoHistory();

        render(
            <Provider store={store}>
                <EditorControls editorDarkMode={false} minimized={false} />
            </Provider>,
        );

        fireEvent.keyDown(window, { ctrlKey: true, key: "z" });

        expect(store.getState().pokemon[0].nickname).toBe("First");
        expect(store.getState().editorHistory.present?.pokemon?.[0]?.nickname).toBe(
            "First",
        );
    });
});
