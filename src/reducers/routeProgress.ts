import {
    Action,
    UPDATE_COMPLETED_ROUTES,
    UPDATE_SKIPPED_ROUTES,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "../actions";

export function completedRoutes(
    state: string[] = [],
    action: Action<UPDATE_COMPLETED_ROUTES | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case UPDATE_COMPLETED_ROUTES:
            return action.completedRoutes;
        case REPLACE_STATE:
            return action.replaceWith.completedRoutes ?? [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.completedRoutes ?? [];
        default:
            return state;
    }
}

export function skippedRoutes(
    state: string[] = [],
    action: Action<UPDATE_SKIPPED_ROUTES | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case UPDATE_SKIPPED_ROUTES:
            return action.skippedRoutes;
        case REPLACE_STATE:
            return action.replaceWith.skippedRoutes ?? [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.skippedRoutes ?? [];
        default:
            return state;
    }
}

