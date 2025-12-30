import { Action } from "./action";

/**
 * Similar to REPLACE_STATE but specifically for undo/redo operations.
 * This action syncs all reducers with a state snapshot without resetting editorHistory.
 */
export type SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";
export const SYNC_STATE_FROM_HISTORY: SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";

export type syncStateFromHistory = (syncWith: unknown) => Action<SYNC_STATE_FROM_HISTORY, unknown>;
export function syncStateFromHistory(syncWith: unknown): Action<SYNC_STATE_FROM_HISTORY, unknown> {
    return {
        type: SYNC_STATE_FROM_HISTORY,
        syncWith,
    };
}

