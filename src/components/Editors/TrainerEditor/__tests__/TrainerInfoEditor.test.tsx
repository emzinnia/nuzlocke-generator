import * as React from "react";
import type { AnyAction, Reducer } from "redux";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "store/reactZustand";
import { appReducers } from "reducers";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { historyMiddleware } from "middleware/historyMiddleware";
import { State } from "state";
import { TrainerInfoEditor } from "../TrainerInfoEditor";

describe("<TrainerInfoEditor />", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("keeps a character typed while the previous edit is still being recorded", () => {
        vi.useFakeTimers();
        const store = createReduxCompatibleZustandStore({
            initialState: createDefaultState(),
            middlewares: [historyMiddleware],
            reducer: appReducers as unknown as Reducer<State, AnyAction>,
        });
        store.dispatch({ type: "persist/REHYDRATE" } as AnyAction);

        render(
            <Provider store={store}>
                <TrainerInfoEditor />
            </Provider>,
        );
        const input = document.querySelector(
            'input[name="title"]',
        ) as HTMLInputElement;

        fireEvent.change(input, { target: { value: "A" } });
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(store.getState().trainer.title).toBe("A");
        expect(input.value).toBe("A");

        // History records that commit 300ms later. Type the next character
        // inside that window, then let the history update land before the
        // field's own debounce.
        act(() => {
            vi.advanceTimersByTime(100);
        });
        fireEvent.change(input, { target: { value: "AB" } });
        expect(input.value).toBe("AB");

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(input.value).toBe("AB");

        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(store.getState().trainer.title).toBe("AB");
    });
});
