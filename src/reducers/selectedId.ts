import {
    Action,
    DELETE_POKEMON,
    REPLACE_STATE,
    SELECT_POKEMON,
    SYNC_STATE_FROM_HISTORY,
} from "../actions";
import { State } from "state";

const reconcileSelectedId = (
    selectedId: string,
    pokemon: State["pokemon"] | undefined,
) => {
    if (!Array.isArray(pokemon)) {
        return selectedId;
    }

    if (selectedId && pokemon.some((poke) => poke.id === selectedId)) {
        return selectedId;
    }

    return pokemon[0]?.id ?? "";
};

export function selectedId(
    state: State["selectedId"] = "",
    action: Action<
        SELECT_POKEMON | DELETE_POKEMON | REPLACE_STATE | SYNC_STATE_FROM_HISTORY
    >,
) {
    switch (action.type) {
        case SELECT_POKEMON:
            return action.id;
        case DELETE_POKEMON:
            return action.id === state ? "" : state;
        case REPLACE_STATE:
            return reconcileSelectedId(
                action.replaceWith.selectedId ?? state,
                action.replaceWith.pokemon,
            );
        case SYNC_STATE_FROM_HISTORY:
            return reconcileSelectedId(
                action.syncWith.selectedId ?? state,
                action.syncWith.pokemon,
            );
        default:
            return state;
    }
}
