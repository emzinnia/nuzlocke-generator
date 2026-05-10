import * as React from "react";
import type { AnyAction, Dispatch } from "redux";
import { State } from "state";
import { ReduxCompatibleZustandStore } from "./zustandReduxStore";

type LooseObject = Record<string, unknown>;
type ActionCreatorsMapObject = Record<string, (...args: unknown[]) => AnyAction>;

const StoreContext =
    React.createContext<ReduxCompatibleZustandStore | undefined>(undefined);

export interface ProviderProps {
    children?: React.ReactNode;
    store: ReduxCompatibleZustandStore;
}

export function Provider({ children, store }: ProviderProps) {
    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
}

export const useStore = () => {
    const store = React.useContext(StoreContext);
    if (!store) {
        throw new Error("Zustand store is missing. Wrap this tree in Provider.");
    }
    return store;
};

export const useDispatch = () => useStore().dispatch;

export function useSelector<TState = State, Selected = unknown>(
    selector: (state: TState) => Selected,
): Selected {
    const store = useStore();
    const state = React.useSyncExternalStore(
        store.subscribe,
        store.getState,
        store.getState,
    );

    return selector(state as unknown as TState);
}

const bindActionCreators = (
    actionCreators: ActionCreatorsMapObject,
    dispatch: Dispatch<AnyAction>,
) =>
    Object.fromEntries(
        Object.entries(actionCreators).map(([key, actionCreator]) => [
            key,
            (...args: unknown[]) => dispatch(actionCreator(...args)),
        ]),
    );

export function connect(
    mapStateToProps?: unknown,
    mapDispatchToProps?: unknown,
    ..._unusedOptions: unknown[]
) {
    return function connectComponent<P>(
        WrappedComponent: React.ComponentType<P>,
    ) {
        const Connected = React.forwardRef<unknown, Partial<P> & LooseObject>(
            (ownProps, ref) => {
                const store = useStore();
                const state = React.useSyncExternalStore(
                    store.subscribe,
                    store.getState,
                    store.getState,
                );
                const mapState =
                    typeof mapStateToProps === "function"
                        ? (mapStateToProps as (
                              state: State,
                              ownProps: LooseObject,
                          ) => LooseObject)
                        : undefined;
                const stateProps = mapState
                    ? mapState(state, ownProps)
                    : {};
                const dispatchProps =
                    typeof mapDispatchToProps === "function"
                        ? (
                              mapDispatchToProps as (
                                  dispatch: Dispatch<AnyAction>,
                                  ownProps: LooseObject,
                              ) => LooseObject
                          )(store.dispatch, ownProps)
                        : mapDispatchToProps
                          ? bindActionCreators(
                                mapDispatchToProps as ActionCreatorsMapObject,
                                store.dispatch,
                            )
                          : {};

                return React.createElement(
                    WrappedComponent as React.ComponentType<LooseObject>,
                    {
                        ...ownProps,
                        ...stateProps,
                        ...dispatchProps,
                        ref,
                    },
                );
            },
        );

        Connected.displayName = `ZustandConnect(${
            WrappedComponent.displayName || WrappedComponent.name || "Component"
        })`;

        return Connected as unknown as React.ComponentType<
            Partial<P> & LooseObject
        >;
    };
}
