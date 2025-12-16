import { Action, EDIT_STYLE, REPLACE_STATE, SYNC_STATE_FROM_HISTORY } from "actions";
import { styleDefaults } from "utils";

export function style(
    state = styleDefaults,
    action: Action<EDIT_STYLE | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case EDIT_STYLE:
            return { ...state, ...action.edits };
        case REPLACE_STATE:
            return action.replaceWith.style;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.style;
        default:
            return state;
    }
}
