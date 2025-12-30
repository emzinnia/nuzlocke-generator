import { Action, EDIT_TRAINER, REPLACE_STATE, SYNC_STATE_FROM_HISTORY } from "../actions";

export function trainer(
    state = { badges: [] },
    action: Action<EDIT_TRAINER | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case EDIT_TRAINER:
            return { ...state, ...action.edits };
        case REPLACE_STATE:
            return action.replaceWith.trainer;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith?.trainer ?? state;
        default:
            return state;
    }
}
