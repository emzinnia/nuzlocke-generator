import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editTrainer, replaceState } from "actions";
import { State } from "state";
import { createNuzlockeStore } from "store";
import { reconstructPreviousState } from "reducers/editorHistory";

describe("historyMiddleware", () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        window.localStorage.clear();
    });

    it("cancels pending history and resets the baseline when state is replaced", () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const replacementState: State = {
            ...store.getState(),
            trainer: {
                ...store.getState().trainer,
                name: "Imported Trainer",
            },
        };

        store.dispatch(editTrainer({ name: "Pending Old Save Edit" }));
        store.dispatch(replaceState(replacementState));
        vi.advanceTimersByTime(301);

        expect(store.getState().editorHistory.past).toEqual([]);
        expect(
            (store.getState().editorHistory.present as State).trainer.name,
        ).toBe("Imported Trainer");

        store.dispatch(editTrainer({ name: "Edited Imported Trainer" }));
        vi.advanceTimersByTime(301);

        const { editorHistory } = store.getState();
        expect(editorHistory.past).toHaveLength(1);
        expect((editorHistory.present as State).trainer.name).toBe(
            "Edited Imported Trainer",
        );
        expect(
            (
                reconstructPreviousState(
                    editorHistory.present,
                    editorHistory.past[0],
                ) as State
            ).trainer.name,
        ).toBe("Imported Trainer");

        unsubscribePersistence();
    });
});
