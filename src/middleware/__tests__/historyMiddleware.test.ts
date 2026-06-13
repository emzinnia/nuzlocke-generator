import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnyAction, Reducer } from "redux";
import { editStyle, replaceState } from "actions";
import { historyMiddleware } from "../historyMiddleware";
import { appReducers } from "reducers";
import { History, reconstructPreviousState } from "reducers/editorHistory";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { State } from "state";

type TrackableState = Omit<State, "editorHistory">;

const createStoreWithHistory = () => {
    const defaultState = createDefaultState();
    const store = createReduxCompatibleZustandStore({
        initialState: defaultState,
        middlewares: [historyMiddleware],
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });

    store.dispatch({ type: "persist/REHYDRATE" } as AnyAction);

    return { defaultState, store };
};

describe("historyMiddleware", () => {
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("cancels pending history commits when replacing the full state", () => {
        vi.useFakeTimers();
        const { defaultState, store } = createStoreWithHistory();
        const replacementState: State = {
            ...defaultState,
            style: {
                ...defaultState.style,
                bgColor: "#222222",
            },
        };

        store.dispatch(editStyle({ bgColor: "#111111" }));
        store.dispatch(replaceState(replacementState));
        vi.advanceTimersByTime(300);

        const editorHistory =
            store.getState().editorHistory as History<TrackableState>;
        expect(editorHistory.past).toHaveLength(0);
        expect(editorHistory.present?.style.bgColor).toBe("#222222");
    });

    it("uses replaced state as the undo baseline for subsequent edits", () => {
        vi.useFakeTimers();
        const { defaultState, store } = createStoreWithHistory();
        const replacementState: State = {
            ...defaultState,
            style: {
                ...defaultState.style,
                bgColor: "#222222",
            },
        };

        store.dispatch(replaceState(replacementState));
        store.dispatch(editStyle({ bgColor: "#333333" }));
        vi.advanceTimersByTime(300);

        const editorHistory =
            store.getState().editorHistory as History<TrackableState>;
        const previousState = reconstructPreviousState(
            editorHistory.present,
            editorHistory.past[0],
        );

        expect(editorHistory.past).toHaveLength(1);
        expect(editorHistory.present?.style.bgColor).toBe("#333333");
        expect(previousState?.style.bgColor).toBe("#222222");
    });
});
