import { Action } from "./action";
import { State } from "state";

/**
 * Similar to REPLACE_STATE but specifically for undo/redo operations.
 * This action syncs all reducers with a state snapshot without resetting editorHistory.
 */
export type SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";
export const SYNC_STATE_FROM_HISTORY: SYNC_STATE_FROM_HISTORY = "SYNC_STATE_FROM_HISTORY";

export interface SyncStateFromHistoryAction
    extends Action<SYNC_STATE_FROM_HISTORY, Partial<State>> {
    syncWith: Partial<State>;
}

export type syncStateFromHistory = (
    syncWith: Partial<State>,
) => SyncStateFromHistoryAction;
export function syncStateFromHistory(
    syncWith: Partial<State>,
): SyncStateFromHistoryAction {
    return {
        type: SYNC_STATE_FROM_HISTORY,
        syncWith,
    };
}
