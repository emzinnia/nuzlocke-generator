import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editTrainer, replaceState } from "actions";
import { reconstructPreviousState } from "reducers/editorHistory";
import { createDefaultState, createNuzlockeStore } from "store";
import { State } from "state";

describe("historyMiddleware", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        window.localStorage.clear();
    });

    it("cancels pending history commits and rebases undo history when replacing state", () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const replacementState: State = {
            ...createDefaultState(),
            trainer: {
                badges: [],
                name: "Imported Trainer",
            },
        };

        store.dispatch(editTrainer({ name: "Unsaved Pre-Import Edit" }));
        store.dispatch(replaceState(replacementState));
        vi.advanceTimersByTime(300);

        store.dispatch(editTrainer({ name: "Edited Imported Trainer" }));
        vi.advanceTimersByTime(300);

        const { editorHistory } = store.getState();
        const previousState = reconstructPreviousState(
            editorHistory.present,
            editorHistory.past[0],
        );

        expect(editorHistory.past).toHaveLength(1);
        expect(previousState.trainer.name).toBe("Imported Trainer");

        unsubscribePersistence();
    });
});
