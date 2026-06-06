import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editTrainer, replaceState } from "actions";
import { createNuzlockeStore } from "store";
import { reconstructPreviousState } from "reducers/editorHistory";
import { State } from "state";

describe("historyMiddleware", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        window.localStorage.clear();
    });

    const flushDebouncedHistory = async () => {
        vi.advanceTimersByTime(350);
        await Promise.resolve();
    };

    it("starts a fresh undo baseline after replacing the full state", async () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const importedState = {
            ...store.getState(),
            trainer: {
                ...store.getState().trainer,
                name: "Imported",
            },
        };

        store.dispatch(replaceState(importedState));

        expect(store.getState().editorHistory.present).toMatchObject({
            trainer: { name: "Imported" },
        });
        expect(store.getState().editorHistory.past).toEqual([]);

        store.dispatch(editTrainer({ name: "After import edit" }));
        await flushDebouncedHistory();

        const { editorHistory } = store.getState();
        expect(editorHistory.past).toHaveLength(1);
        const previousState = reconstructPreviousState(
            editorHistory.present as Omit<State, "editorHistory">,
            editorHistory.past[0],
        );
        expect(previousState).toMatchObject({
            trainer: { name: "Imported" },
        });

        unsubscribePersistence();
    });
});
