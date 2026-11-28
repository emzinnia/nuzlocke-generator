import * as React from "react";
import { Provider } from "store/reactZustand";
import type { AnyAction, Reducer } from "redux";
import { appReducers } from "reducers";
import { createDefaultState } from "store";
import { createReduxCompatibleZustandStore } from "store/zustandReduxStore";
import { generateEmptyPokemon } from "utils";
import { State } from "state";

export function TestProvider({ children }: { children?: React.ReactNode }) {
    const store = React.useMemo(() => {
        const defaultState = createDefaultState();

        return createReduxCompatibleZustandStore({
            initialState: {
                ...defaultState,
                pokemon: [generateEmptyPokemon(), generateEmptyPokemon()],
                style: {
                    ...defaultState.style,
                    editorDarkMode: false,
                },
            },
            reducer: appReducers as unknown as Reducer<State, AnyAction>,
        });
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
