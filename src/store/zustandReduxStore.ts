import type {
    AnyAction,
    Dispatch,
    Middleware,
    Reducer,
    Store,
} from "redux";
import { createStore as createZustandStore, StoreApi } from "zustand/vanilla";
import { State } from "state";

export type ReduxCompatibleZustandStore = Store<State, AnyAction> & {
    zustandStore: StoreApi<State>;
};

interface CreateReduxCompatibleZustandStoreOptions {
    initialState: State;
    middlewares?: Middleware[];
    reducer: Reducer<State, AnyAction>;
}

export const createReduxCompatibleZustandStore = ({
    initialState,
    middlewares = [],
    reducer,
}: CreateReduxCompatibleZustandStoreOptions): ReduxCompatibleZustandStore => {
    const zustandStore = createZustandStore<State>(() => initialState);
    let currentReducer = reducer;

    const baseDispatch: Dispatch<AnyAction> = (action) => {
        if (!action || typeof action.type === "undefined") {
            throw new Error("Actions must have a type.");
        }

        const previousState = zustandStore.getState();
        const nextState = currentReducer(previousState, action);
        zustandStore.setState(nextState, true);
        return action;
    };
    const dispatchRef: { current: Dispatch<AnyAction> } = {
        current: baseDispatch,
    };

    const store = {
        dispatch: (action: AnyAction) => dispatchRef.current(action),
        getState: zustandStore.getState,
        replaceReducer: (nextReducer: Reducer<State, AnyAction>) => {
            currentReducer = nextReducer;
            store.dispatch({ type: "@@redux/REPLACE" });
        },
        subscribe: (listener: () => void) =>
            zustandStore.subscribe(() => listener()),
        zustandStore,
    };

    const middlewareApi = {
        dispatch: (action: AnyAction) => dispatchRef.current(action),
        getState: store.getState,
    };
    const chain = middlewares.map((middleware) =>
        middleware(middlewareApi as Parameters<typeof middleware>[0]),
    );
    dispatchRef.current = chain.reduceRight(
        (next, middleware) => middleware(next),
        baseDispatch,
    );

    return store as unknown as ReduxCompatibleZustandStore;
};
