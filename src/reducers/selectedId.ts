import {
    Action,
    REPLACE_STATE,
    SELECT_POKEMON,
    SYNC_STATE_FROM_HISTORY,
} from "../actions";
import { State } from "state";

const getRestoredSelectedId = (
    currentId: State["selectedId"],
    restoredState: Partial<State> | undefined,
) => {
    const pokemon = restoredState?.pokemon;
    if (!Array.isArray(pokemon)) {
        return currentId;
    }

    if (pokemon.some((poke) => poke.id === restoredState?.selectedId)) {
        return restoredState?.selectedId ?? "";
    }

    if (pokemon.some((poke) => poke.id === currentId)) {
        return currentId;
    }

    return pokemon[0]?.id ?? "";
};

export function selectedId(
    state: State["selectedId"] = "",
    action: Action<SELECT_POKEMON | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case SELECT_POKEMON:
            return action.id;
        case REPLACE_STATE:
            return getRestoredSelectedId(state, action.replaceWith);
        case SYNC_STATE_FROM_HISTORY:
            return getRestoredSelectedId(state, action.syncWith);
        default:
            return state;
    }
}
