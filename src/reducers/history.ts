import {
    Action,
    ADD_HISTORY_ENTRY,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    REMOVE_HISTORY_ENTRY,
} from "../actions";
import { HistoryEntry } from "models";

export function history(
    state: HistoryEntry[] = [],
    action: Action<ADD_HISTORY_ENTRY | REPLACE_STATE | SYNC_STATE_FROM_HISTORY | REMOVE_HISTORY_ENTRY>,
) {
    switch (action.type) {
        case ADD_HISTORY_ENTRY:
            return [...state, action.history];
        case REMOVE_HISTORY_ENTRY:
            return state.filter((h) => h.id !== action.id);
        case REPLACE_STATE:
            return action.replaceWith.history;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.history;
        default:
            return state;
    }
}
