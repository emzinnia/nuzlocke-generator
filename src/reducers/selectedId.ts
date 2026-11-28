import { Action, SELECT_POKEMON } from "../actions";
import { State } from "state";

export function selectedId(
    state: State["selectedId"] = "",
    action: Action<SELECT_POKEMON>,
) {
    switch (action.type) {
        case SELECT_POKEMON:
            return action.id;
        default:
            return state;
    }
}
