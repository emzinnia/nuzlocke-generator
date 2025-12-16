import { Middleware, AnyAction } from "redux";
import { diff } from "deep-diff";
import debounce from "lodash.debounce";
import { omit } from "ramda";
import {
    updateEditorHistory,
    initEditorHistory,
    UNDO_EDITOR_HISTORY,
    REDO_EDITOR_HISTORY,
    INIT_EDITOR_HISTORY,
    UPDATE_EDITOR_HISTORY,
    SYNC_STATE_FROM_HISTORY,
    CHANGE_EDITOR_SIZE,
    REPLACE_STATE,
    TOGGLE_TEMTEM_MODE,
    TOGGLE_MOBILE_RESULT_VIEW,
    SELECT_POKEMON,
    MODIFY_DELETION_CONFIRMATION,
    SEE_RELEASE,
    TRIGGER_DOWNLOAD,
    TOGGLE_DIALOG,
    JUMP_TO_HISTORY_STATE,
} from "actions";
import { State } from "state";
import { DiffEntry } from "reducers/editorHistory";

// Debounce delay in milliseconds - batches rapid changes together
const HISTORY_DEBOUNCE_MS = 300;

/**
 * Actions that should NOT create history entries.
 * These are either:
 * - History management actions (would cause infinite loops)
 * - UI-only actions that don't affect nuzlocke data
 * - State replacement actions (used during undo/redo)
 */
const EXCLUDED_ACTIONS = new Set<string>([
    // History management actions
    UNDO_EDITOR_HISTORY,
    REDO_EDITOR_HISTORY,
    INIT_EDITOR_HISTORY,
    UPDATE_EDITOR_HISTORY,
    SYNC_STATE_FROM_HISTORY,
    REPLACE_STATE,
    JUMP_TO_HISTORY_STATE,

    // UI-only actions (don't affect nuzlocke data)
    CHANGE_EDITOR_SIZE,
    TOGGLE_TEMTEM_MODE,
    TOGGLE_MOBILE_RESULT_VIEW,
    SELECT_POKEMON,
    MODIFY_DELETION_CONFIRMATION,
    SEE_RELEASE,
    TRIGGER_DOWNLOAD,
    TOGGLE_DIALOG,

    // Redux persist actions
    "persist/PERSIST",
    "persist/REHYDRATE",
]);

/**
 * Get the trackable state (excluding editorHistory which would cause circular updates)
 */
function getTrackableState(state: State): Omit<State, "editorHistory"> {
    return omit(["editorHistory"], state);
}

/**
 * Redux middleware that tracks state changes and creates undo/redo history entries.
 * 
 * This middleware:
 * 1. Intercepts all actions AFTER they've been processed by reducers
 * 2. Computes diffs between the previous and new state
 * 3. Debounces rapid changes (e.g., typing) into single history entries
 * 4. Excludes UI-only and history management actions from tracking
 */
export const historyMiddleware: Middleware = (store) => {
    // Reference to the last committed state for diff computation
    let lastCommittedState: Omit<State, "editorHistory"> | null = null;
    // Track if we've initialized history
    let initialized = false;

    // Debounced function to commit history updates
    const debouncedCommit = debounce((newState: Omit<State, "editorHistory">) => {
        if (lastCommittedState) {
            // Compute the diff between last committed and new state
            const changes = diff(lastCommittedState, newState) as DiffEntry | undefined;

            if (changes && changes.length > 0) {
                // Dispatch the history update with the diff
                store.dispatch(updateEditorHistory(changes, newState) as AnyAction);
            }
        }
        // Update our reference to the last committed state
        lastCommittedState = newState;
    }, HISTORY_DEBOUNCE_MS);

    return (next) => (action: AnyAction) => {
        // Let the action pass through to reducers first
        const result = next(action);

        // Get the new state after the action was processed
        const fullState = store.getState() as State;
        const newState = getTrackableState(fullState);

        // Initialize history on first action (usually persist/REHYDRATE)
        if (!initialized && action.type === "persist/REHYDRATE") {
            initialized = true;
            lastCommittedState = newState;
            store.dispatch(initEditorHistory(newState) as AnyAction);
            return result;
        }

        // Skip history tracking for excluded actions
        if (EXCLUDED_ACTIONS.has(action.type)) {
            // When undo/redo/jump starts, cancel any pending debounced commits
            if (action.type === UNDO_EDITOR_HISTORY || action.type === REDO_EDITOR_HISTORY || action.type === JUMP_TO_HISTORY_STATE) {
                debouncedCommit.cancel();
            }
            
            // Update lastCommittedState ONLY after SYNC_STATE_FROM_HISTORY
            // This is when all reducers have been updated to the undo/redo state
            if (action.type === SYNC_STATE_FROM_HISTORY) {
                debouncedCommit.cancel();
                lastCommittedState = newState;
            }
            return result;
        }

        // Skip if we haven't initialized yet
        if (!initialized || !lastCommittedState) {
            return result;
        }

        // Queue a debounced history commit
        debouncedCommit(newState);

        return result;
    };
};

/**
 * Flush any pending history updates immediately.
 * Useful when you need to ensure history is saved before an operation.
 */
export const flushHistoryMiddleware = (store: { dispatch: (action: AnyAction) => void }) => {
    // The debounced function has a flush method from lodash
    // This is a placeholder - in practice you'd need to export the debounced function
    // or use a different pattern if immediate flushing is needed
};

