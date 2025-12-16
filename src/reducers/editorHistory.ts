import {
    Action,
    REDO_EDITOR_HISTORY,
    UNDO_EDITOR_HISTORY,
    UPDATE_EDITOR_HISTORY,
    REPLACE_STATE,
    INIT_EDITOR_HISTORY,
    JUMP_TO_HISTORY_STATE,
} from "actions";
import { Diff } from "deep-diff";
import { take } from "ramda";

// A single diff entry represents the changes between two states
export type DiffEntry = Diff<any, any>[];

// A history entry stores both the previous state and the state after the change
// This is more reliable than trying to revert diffs
export interface HistoryEntry<T> {
    // The state BEFORE this change was made (for undo)
    previousState: T;
    // The state AFTER this change was made (for redo)
    nextState: T;
}

export interface History<T> {
    // Store state snapshots for reliable undo/redo
    past: HistoryEntry<T>[];
    // The current state snapshot
    present?: T;
    // Future entries for redo
    future: HistoryEntry<T>[];
    // Track the last revision type
    lastRevisionType: "undo" | "redo" | "update" | "load";
}

const initial: History<any> = {
    past: [],
    present: undefined,
    future: [],
    lastRevisionType: "update",
};

const MAX_HISTORY_LENGTH = 50;

/**
 * Deep clone an object to avoid mutations
 */
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Get the previous state from a history entry (for undo)
 */
export function getPreviousState<T>(entry: HistoryEntry<T>): T {
    return entry.previousState;
}

/**
 * Get the next state from a history entry (for redo)
 */
export function getNextState<T>(entry: HistoryEntry<T>): T {
    return entry.nextState;
}

export function editorHistory(
    state: History<any> = initial,
    action: Action<
        | UNDO_EDITOR_HISTORY
        | UPDATE_EDITOR_HISTORY
        | REDO_EDITOR_HISTORY
        | REPLACE_STATE
        | INIT_EDITOR_HISTORY
        | JUMP_TO_HISTORY_STATE
    >,
): History<any> {
    switch (action.type) {
        // Initialize history with the first state snapshot
        case INIT_EDITOR_HISTORY: {
            return {
                ...state,
                present: deepClone(action.present),
                lastRevisionType: "load",
            };
        }

        case UPDATE_EDITOR_HISTORY: {
            const { present, past } = state;

            // If we don't have a present yet, just store the new state
            if (present == null) {
                return {
                    past: [],
                    present: deepClone(action.newState),
                    future: [],
                    lastRevisionType: "update",
                };
            }

            // Check if there's actually a change (action.diff is still passed for this check)
            if (action.diff == null || action.diff.length === 0) {
                return state;
            }

            // Create a history entry with both previous and next states
            const entry: HistoryEntry<any> = {
                previousState: deepClone(present),
                nextState: deepClone(action.newState),
            };

            return {
                // Store the entry - limit to MAX_HISTORY_LENGTH
                past: [...take(MAX_HISTORY_LENGTH - 1, past), entry],
                // Update present to the new state
                present: deepClone(action.newState),
                // Clear future on new changes (can't redo after new edits)
                future: [],
                lastRevisionType: "update",
            };
        }

        case UNDO_EDITOR_HISTORY: {
            const { past, present, future } = state;

            if (past.length === 0 || present == null) {
                return state;
            }

            // Get the last entry
            const lastEntry = past[past.length - 1];
            const newPast = past.slice(0, -1);

            // Use the stored previous state directly
            const previousState = lastEntry.previousState;

            return {
                past: newPast,
                present: previousState,
                // Store the entry in future for potential redo
                future: [lastEntry, ...future],
                lastRevisionType: "undo",
            };
        }

        case REDO_EDITOR_HISTORY: {
            const { past, present, future } = state;

            if (future.length === 0 || present == null) {
                return state;
            }

            // Get the first future entry
            const nextEntry = future[0];
            const newFuture = future.slice(1);

            // Use the stored next state directly
            const nextState = nextEntry.nextState;

            return {
                // Move entry to past
                past: [...past, nextEntry],
                present: nextState,
                future: newFuture,
                lastRevisionType: "redo",
            };
        }

        case JUMP_TO_HISTORY_STATE: {
            const { past, present, future } = state;
            const targetIndex = action.index;
            
            // Build a combined timeline:
            // - past entries (index 0 to past.length-1)
            // - current/present (index = past.length)
            // - future entries (index past.length+1 onwards)
            const currentIndex = past.length;
            
            if (targetIndex === currentIndex || present == null) {
                return state; // Already at this state
            }
            
            // Combine all entries to make navigation easier
            const allEntries = [...past];
            const allStates: any[] = [];
            
            // Extract all states in order
            // First state is the previousState of the first entry
            if (past.length > 0) {
                allStates.push(past[0].previousState);
                for (const entry of past) {
                    allStates.push(entry.nextState);
                }
            } else {
                allStates.push(present);
            }
            
            // Add future states
            for (const entry of future) {
                allStates.push(entry.nextState);
            }
            
            // Target state
            const targetState = allStates[targetIndex];
            if (!targetState) {
                return state;
            }
            
            // Rebuild past/future based on target index
            const newPast: HistoryEntry<any>[] = [];
            const newFuture: HistoryEntry<any>[] = [];
            
            // Build new past (all states before target)
            for (let i = 0; i < targetIndex; i++) {
                newPast.push({
                    previousState: allStates[i],
                    nextState: allStates[i + 1],
                });
            }
            
            // Build new future (all states after target)
            for (let i = targetIndex; i < allStates.length - 1; i++) {
                newFuture.push({
                    previousState: allStates[i],
                    nextState: allStates[i + 1],
                });
            }
            
            return {
                past: newPast,
                present: deepClone(targetState),
                future: newFuture,
                lastRevisionType: targetIndex < currentIndex ? "undo" : "redo",
            };
        }

        // Return initial state when entire state tree gets replaced
        case REPLACE_STATE:
            return initial;

        default:
            return state;
    }
}
