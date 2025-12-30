import {
    Action,
    UPDATE_EXCLUDED_AREAS,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    UPDATE_CUSTOM_AREAS,
} from "../actions";

export function excludedAreas(
    state: string[] = [],
    action: Action<UPDATE_EXCLUDED_AREAS | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case UPDATE_EXCLUDED_AREAS:
            return action.excludedAreas;
        case REPLACE_STATE:
            return action.replaceWith.excludedAreas ?? [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.excludedAreas ?? [];
        default:
            return state;
    }
}

export function customAreas(
    state: string[] = [],
    action: Action<UPDATE_CUSTOM_AREAS | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case UPDATE_CUSTOM_AREAS:
            return action.areas;
        case REPLACE_STATE:
            return action.replaceWith.areas ?? [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.areas ?? [];
        default:
            return state;
    }
}
