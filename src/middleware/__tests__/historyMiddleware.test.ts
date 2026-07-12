import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editStyle, replaceState } from "actions";
import { createDefaultState, createNuzlockeStore } from "store";
import { State } from "state";

const HISTORY_DEBOUNCE_MS = 300;

describe("historyMiddleware", () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        window.localStorage.clear();
    });

    it("cancels pending commits and reinitializes history after replacing state", () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const defaultState = createDefaultState();
        const restoredState: State = {
            ...defaultState,
            trainer: {
                ...defaultState.trainer,
                name: "Restored Trainer",
            },
            style: {
                ...defaultState.style,
                bgColor: "#abcdef",
            },
        };

        store.dispatch(editStyle({ bgColor: "#111111" }));
        store.dispatch(replaceState(restoredState));
        vi.advanceTimersByTime(HISTORY_DEBOUNCE_MS + 1);

        const historyAfterRestore = store.getState().editorHistory;
        const presentAfterRestore = historyAfterRestore.present as State;
        expect(presentAfterRestore.trainer.name).toBe("Restored Trainer");
        expect(presentAfterRestore.style.bgColor).toBe("#abcdef");
        expect(historyAfterRestore.past).toEqual([]);

        store.dispatch(editStyle({ bgColor: "#222222" }));
        vi.advanceTimersByTime(HISTORY_DEBOUNCE_MS + 1);

        const historyAfterEdit = store.getState().editorHistory;
        const presentAfterEdit = historyAfterEdit.present as State;
        expect(historyAfterEdit.past).toHaveLength(1);
        expect(presentAfterEdit.trainer.name).toBe("Restored Trainer");
        expect(presentAfterEdit.style.bgColor).toBe("#222222");

        unsubscribePersistence();
    });
});
