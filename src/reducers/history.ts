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
            return Array.isArray(action.replaceWith?.history)
                ? action.replaceWith.history
                : state;
        case SYNC_STATE_FROM_HISTORY:
            return Array.isArray(action.syncWith?.history)
                ? action.syncWith.history
                : state;
        default:
            return state;
    }
}
