/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import { Action } from "./action";

/**
 * Similar to REPLACE_STATE but specifically for undo/redo operations.
 * This action syncs all reducers with a state snapshot without resetting editorHistory.
 */
export type SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";
export const SYNC_STATE_FROM_HISTORY: SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";

export type syncStateFromHistory = (syncWith: any) => Action<SYNC_STATE_FROM_HISTORY>;
export function syncStateFromHistory(syncWith: any): Action<SYNC_STATE_FROM_HISTORY> {
    return {
        type: SYNC_STATE_FROM_HISTORY,
        syncWith,
    };
}

