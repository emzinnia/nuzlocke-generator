import { Action, EDIT_THEME } from "actions";

export function theme(state, action: Action<EDIT_THEME>) {
    switch (action.type) {
        case EDIT_THEME:
            return state;
        default:
            return state;
    }
}
