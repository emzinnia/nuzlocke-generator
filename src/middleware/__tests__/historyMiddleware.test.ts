import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editStyle, replaceState } from "actions";
import { reconstructPreviousState } from "reducers/editorHistory";
import { createDefaultState, createNuzlockeStore } from "store";
import { State } from "state";

const HISTORY_DEBOUNCE_MS = 300;

const createReplacementState = (): State => ({
    ...createDefaultState(),
    game: {
        name: "Emerald",
        customName: "Imported run",
    },
    style: {
        ...createDefaultState().style,
        bgColor: "#123456",
    },
});

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

    it("cancels pending history commits when replacing the full state", () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const replacement = createReplacementState();

        store.dispatch(editStyle({ bgColor: "#654321" }));
        store.dispatch(replaceState(replacement));
        vi.advanceTimersByTime(HISTORY_DEBOUNCE_MS + 1);

        expect(store.getState().editorHistory.present).toMatchObject({
            game: replacement.game,
            style: expect.objectContaining({ bgColor: "#123456" }),
        });
        expect(store.getState().editorHistory.past).toEqual([]);

        unsubscribePersistence();
    });

    it("anchors the first undo entry after replacing the full state", () => {
        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });
        const replacement = createReplacementState();

        store.dispatch(replaceState(replacement));
        store.dispatch(editStyle({ bgColor: "#abcdef" }));
        vi.advanceTimersByTime(HISTORY_DEBOUNCE_MS + 1);

        const { editorHistory } = store.getState();
        expect(editorHistory.past).toHaveLength(1);

        const previousState = reconstructPreviousState(
            editorHistory.present,
            editorHistory.past[0],
        );

        expect(previousState).toMatchObject({
            game: replacement.game,
            style: expect.objectContaining({ bgColor: "#123456" }),
        });

        unsubscribePersistence();
    });
});
