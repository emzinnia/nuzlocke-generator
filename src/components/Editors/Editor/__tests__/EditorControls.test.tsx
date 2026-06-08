import * as React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { diff } from "deep-diff";
import type { AnyAction, Reducer } from "redux";
import { describe, expect, it } from "vitest";
import { Provider } from "store/reactZustand";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { appReducers } from "reducers";
import { DiffEntry, HistoryEntry } from "reducers/editorHistory";
import { State } from "state";
import { EditorControls } from "../EditorControls";

type TrackableState = Omit<State, "editorHistory">;

const toTrackableState = (state: State): TrackableState => {
    const snapshot = { ...state } as Partial<State>;
    delete snapshot.editorHistory;
    return snapshot as TrackableState;
};

const createSnapshot = (trainerName: string): TrackableState => {
    const snapshot = toTrackableState(createDefaultState());
    return {
        ...snapshot,
        trainer: {
            ...snapshot.trainer,
            name: trainerName,
        },
    };
};

const createHistoryEntry = (
    previousState: TrackableState,
    nextState: TrackableState,
): HistoryEntry => ({
    forwardDiff: diff(previousState, nextState) as DiffEntry,
    backwardDiff: diff(nextState, previousState) as DiffEntry,
});

describe("<EditorControls />", () => {
    it("keeps Ctrl+Z from also triggering redo when redo history is available", async () => {
        const firstState = createSnapshot("first");
        const secondState = createSnapshot("second");
        const thirdState = createSnapshot("third");
        const initialState: State = {
            ...thirdState,
            editorHistory: {
                past: [
                    createHistoryEntry(firstState, secondState),
                    createHistoryEntry(secondState, thirdState),
                ],
                present: thirdState,
                future: [],
                lastRevisionType: "update",
            },
        };
        const store = createReduxCompatibleZustandStore({
            initialState,
            reducer: appReducers as unknown as Reducer<State, AnyAction>,
        });

        render(
            <Provider store={store}>
                <EditorControls editorDarkMode={false} minimized={false} />
            </Provider>,
        );

        fireEvent.keyDown(window, { key: "z", ctrlKey: true });

        await waitFor(() => {
            expect(store.getState().trainer.name).toBe("second");
        });

        fireEvent.keyDown(window, { key: "z", ctrlKey: true });

        await waitFor(() => {
            const state = store.getState();
            expect(state.trainer.name).toBe("first");
            expect(
                (state.editorHistory.present as TrackableState).trainer.name,
            ).toBe("first");
            expect(state.editorHistory.future).toHaveLength(2);
        });
    });
});
