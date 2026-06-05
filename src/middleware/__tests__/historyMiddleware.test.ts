import type { AnyAction, Reducer } from "redux";
import { describe, expect, it, vi } from "vitest";
import {
    editGame,
    replaceState,
    syncStateFromHistory,
    undoEditorHistory,
} from "actions";
import { historyMiddleware } from "../historyMiddleware";
import { appReducers } from "reducers";
import { reconstructPreviousState } from "reducers/editorHistory";
import { State } from "state";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";

function createStore() {
    const initialState = appReducers(
        undefined,
        { type: "@@test/INIT" } as AnyAction,
    ) as unknown as State;
    const store = createReduxCompatibleZustandStore({
        initialState,
        middlewares: [historyMiddleware],
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });

    store.dispatch({ type: "persist/REHYDRATE" } as AnyAction);
    return store;
}

describe("historyMiddleware", () => {
    it("resets pending history and baseline when replacing the full state", () => {
        vi.useFakeTimers();
        try {
            const store = createStore();
            const preImportState = store.getState();

            store.dispatch(editGame({ customName: "Unsaved pre-import edit" }));

            const importedState = {
                ...preImportState,
                game: {
                    ...preImportState.game,
                    customName: "Imported run",
                },
            };
            store.dispatch(replaceState(importedState));
            vi.advanceTimersByTime(300);

            expect(store.getState().editorHistory.present?.game.customName).toBe(
                "Imported run",
            );
            expect(store.getState().editorHistory.past).toHaveLength(0);

            store.dispatch(editGame({ customName: "Post-import edit" }));
            vi.advanceTimersByTime(300);

            const { editorHistory } = store.getState();
            expect(editorHistory.past).toHaveLength(1);
            expect(editorHistory.present?.game.customName).toBe("Post-import edit");

            const previousState = reconstructPreviousState(
                editorHistory.present!,
                editorHistory.past[0],
            );
            store.dispatch(undoEditorHistory());
            store.dispatch(syncStateFromHistory(previousState));

            expect(store.getState().game.customName).toBe("Imported run");
            expect(store.getState().game.customName).not.toBe(
                "Unsaved pre-import edit",
            );
        } finally {
            vi.useRealTimers();
        }
    });
});
