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
            return Array.isArray(action.replaceWith?.excludedAreas)
                ? action.replaceWith.excludedAreas
                : state;
        case SYNC_STATE_FROM_HISTORY:
            return Array.isArray(action.syncWith?.excludedAreas)
                ? action.syncWith.excludedAreas
                : state;
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
            return Array.isArray(action.replaceWith?.customAreas)
                ? action.replaceWith.customAreas
                : state;
        case SYNC_STATE_FROM_HISTORY:
            return Array.isArray(action.syncWith?.customAreas)
                ? action.syncWith.customAreas
                : state;
        default:
            return state;
    }
}
