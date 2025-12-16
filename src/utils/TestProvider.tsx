import * as React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { generateEmptyPokemon } from "utils";
import { State } from "state";

export function TestProvider({ children }: any) {
    const store = configureStore()({
        pokemon: [generateEmptyPokemon(), generateEmptyPokemon()],
        style: {
            editorDarkMode: false,
        },
    } as State);

    // @ts-expect-error - React types version conflict between @types/react and @types/react-redux
    return <Provider store={store}>{children}</Provider>;
}
