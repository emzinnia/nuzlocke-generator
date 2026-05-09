import type { AnyAction, Middleware, Reducer } from "redux";
import { createLogger } from "redux-logger";
// @TODO: figure out this deprecation
import { createBrowserHistory } from "history";
import { useStore } from "zustand";
import { appReducers } from "../reducers";
import { State } from "state";
import { historyMiddleware } from "../middleware/historyMiddleware";
import { setEditorDarkModePreference } from "utils";
import {
    getBrowserStorage,
    purgePersistedState,
    readPersistedState,
    writePersistedState,
} from "./persistence";
import {
    createReduxCompatibleZustandStore,
    ReduxCompatibleZustandStore,
} from "./zustandReduxStore";

const REHYDRATE_ACTION = "persist/REHYDRATE";

export const history = createBrowserHistory();

export const createDefaultState = (): State =>
    appReducers(
        undefined,
        { type: "@@zustand/INIT" } as AnyAction,
    ) as unknown as State;

export const createMiddlewares = (enableLogger: boolean): Middleware[] => {
    const middlewares: Middleware[] = [historyMiddleware];

    if (enableLogger) {
        const loggerMiddleware = createLogger();
        middlewares.push(loggerMiddleware as Middleware);
    }

    return middlewares;
};

export interface Persistor {
    flush: () => Promise<void>;
    purge: () => Promise<void>;
}

interface CreatePersistorOptions {
    storage?: Storage;
    store: ReduxCompatibleZustandStore;
}

const createPersistor = ({
    storage,
    store,
}: CreatePersistorOptions): Persistor => ({
    flush: () =>
        Promise.resolve().then(() => {
            writePersistedState(store.getState(), storage);
        }),
    purge: () =>
        Promise.resolve().then(() => {
            purgePersistedState(storage);
        }),
});

export interface CreateNuzlockeStoreOptions {
    enableLogger?: boolean;
    storage?: Storage;
}

export const createNuzlockeStore = ({
    enableLogger = !import.meta.env.PROD && import.meta.env.MODE !== "test",
    storage = getBrowserStorage(),
}: CreateNuzlockeStoreOptions = {}) => {
    const initialState = {
        ...createDefaultState(),
        ...readPersistedState(storage),
    } as State;
    const store = createReduxCompatibleZustandStore({
        initialState,
        middlewares: createMiddlewares(enableLogger),
        reducer: appReducers as unknown as Reducer<State, AnyAction>,
    });
    const persistor = createPersistor({ storage, store });

    const unsubscribePersistence = store.subscribe(() => {
        void persistor.flush();
    });

    store.dispatch({ type: REHYDRATE_ACTION } as AnyAction);

    return {
        persistor,
        store,
        unsubscribePersistence,
        zustandStore: store.zustandStore,
    };
};

const nuzlockeStore = createNuzlockeStore();

export const store = nuzlockeStore.store;
export const persistor = nuzlockeStore.persistor;
export const zustandStore = nuzlockeStore.zustandStore;

export const useNuzlockeStore = <T>(
    selector: (state: State) => T,
) => useStore(zustandStore, selector);

let lastEditorDarkMode = store.getState().style?.editorDarkMode;
if (typeof lastEditorDarkMode === "boolean") {
    setEditorDarkModePreference(lastEditorDarkMode);
}

store.subscribe(() => {
    const currentEditorDarkMode = store.getState().style?.editorDarkMode;
    if (
        typeof currentEditorDarkMode !== "boolean" ||
        currentEditorDarkMode === lastEditorDarkMode
    ) {
        return;
    }
    lastEditorDarkMode = currentEditorDarkMode;
    setEditorDarkModePreference(currentEditorDarkMode);
});
