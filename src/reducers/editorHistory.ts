import {
    Action,
    REDO_EDITOR_HISTORY,
    UNDO_EDITOR_HISTORY,
    UPDATE_EDITOR_HISTORY,
    REPLACE_STATE,
    INIT_EDITOR_HISTORY,
    JUMP_TO_HISTORY_STATE,
} from "actions";
import { Diff, applyChange, revertChange } from "deep-diff";
import { take } from "ramda";

// A single diff entry represents the changes between two states
export type DiffEntry = Diff<any, any>[];

// A history entry now stores diffs instead of full state snapshots
// This dramatically reduces memory usage for large state trees
export interface HistoryEntry {
    // Changes to apply: previous -> next (for redo)
    forwardDiff: DiffEntry;
    // Changes to apply: next -> previous (for undo)
    backwardDiff: DiffEntry;
}

export interface History<T> {
    // Store diff entries (not full snapshots)
    past: HistoryEntry[];
    // The current state snapshot (always needed for reconstruction base)
    present?: T;
    // Future entries for redo
    future: HistoryEntry[];
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
 * Deep clone an object - only used for present state initialization
 * We keep this minimal since diffs eliminate most cloning needs
 */
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Apply a forward diff to a state to get the next state
 */
function applyForwardDiff<T>(state: T, diff: DiffEntry): T {
    // Clone the state first since applyChange mutates
    const result = deepClone(state);
    for (const change of diff) {
        applyChange(result, null, change);
    }
    return result;
}

/**
 * Apply a backward diff to a state to get the previous state
 */
function applyBackwardDiff<T>(state: T, diff: DiffEntry): T {
    // Clone the state first since revertChange mutates
    const result = deepClone(state);
    for (const change of diff) {
        // backwardDiffs are generated from (new -> old), so applyChange
        // will move the current state back to the previous snapshot.
        applyChange(result, null, change);
    }
    return result;
}

/**
 * Reconstruct the previous state for undo by applying the backward diff to present
 */
export function reconstructPreviousState<T>(present: T, entry: HistoryEntry): T {
    return applyBackwardDiff(present, entry.backwardDiff);
}

/**
 * Reconstruct the next state for redo by applying the forward diff to present
 */
export function reconstructNextState<T>(present: T, entry: HistoryEntry): T {
    return applyForwardDiff(present, entry.forwardDiff);
}

/**
 * Reconstruct a state at a given index in the history timeline
 * Index 0 = earliest state (before first change)
 * Index past.length = current state (present)
 * Index > past.length = future states
 */
export function reconstructStateAtIndex<T>(
    history: History<T>,
    targetIndex: number
): T | undefined {
    const { past, present, future } = history;
    
    if (present == null) {
        return undefined;
    }
    
    const currentIndex = past.length;
    
    // Already at target
    if (targetIndex === currentIndex) {
        return present;
    }
    
    let state = deepClone(present);
    
    if (targetIndex < currentIndex) {
        // Going backward: apply backward diffs from present
        // We need to apply diffs from past[currentIndex-1] down to past[targetIndex]
        for (let i = currentIndex - 1; i >= targetIndex; i--) {
            state = applyBackwardDiff(state, past[i].backwardDiff);
        }
    } else {
        // Going forward: apply forward diffs from present
        // We need to apply diffs from future[0] up to future[targetIndex - currentIndex - 1]
        const stepsForward = targetIndex - currentIndex;
        for (let i = 0; i < stepsForward; i++) {
            state = applyForwardDiff(state, future[i].forwardDiff);
        }
    }
    
    return state;
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
                    present: action.newState,
                    future: [],
                    lastRevisionType: "update",
                };
            }

            // Check if there's actually a change
            const forwardDiff = action.forwardDiff;
            if (forwardDiff == null || forwardDiff.length === 0) {
                return state;
            }

            // Create a history entry with diffs (not full snapshots)
            const entry: HistoryEntry = {
                forwardDiff: forwardDiff,
                backwardDiff: action.backwardDiff,
            };

            return {
                // Store the entry - limit to MAX_HISTORY_LENGTH
                past: [...take(MAX_HISTORY_LENGTH - 1, past), entry],
                // Update present to the new state (no deep clone needed - immutable by convention)
                present: action.newState,
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

            // Reconstruct the previous state by applying the backward diff
            const previousState = applyBackwardDiff(present, lastEntry.backwardDiff);

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

            // Reconstruct the next state by applying the forward diff
            const nextState = applyForwardDiff(present, nextEntry.forwardDiff);

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
            
            // Reconstruct the target state
            const targetState = reconstructStateAtIndex(state, targetIndex);
            if (targetState == null) {
                return state;
            }
            
            // For jump, we need to rebuild the past/future arrays
            // This is more complex with diffs - we need to recompute diffs for the new timeline
            // For simplicity, we'll reconstruct all intermediate states and recompute diffs
            
            // First, reconstruct all states in the timeline
            const allStates: any[] = [];
            
            // Reconstruct states from index 0 to end
            let tempState = deepClone(present);
            
            // Go back to state 0
            for (let i = currentIndex - 1; i >= 0; i--) {
                tempState = applyBackwardDiff(tempState, past[i].backwardDiff);
            }
            allStates.push(tempState);
            
            // Now go forward through all past entries
            for (let i = 0; i < past.length; i++) {
                tempState = applyForwardDiff(tempState, past[i].forwardDiff);
                allStates.push(tempState);
            }
            
            // Add future states
            for (let i = 0; i < future.length; i++) {
                tempState = applyForwardDiff(tempState, future[i].forwardDiff);
                allStates.push(tempState);
            }
            
            // Now rebuild past/future with the original diffs, just rearranged
            const allEntries = [...past, ...future];
            
            const newPast: HistoryEntry[] = [];
            const newFuture: HistoryEntry[] = [];
            
            // Entries before targetIndex go to past
            for (let i = 0; i < targetIndex; i++) {
                if (i < past.length) {
                    newPast.push(past[i]);
                } else {
                    // This was a future entry, need to include it
                    newPast.push(future[i - past.length]);
                }
            }
            
            // Entries at and after targetIndex go to future
            for (let i = targetIndex; i < allEntries.length; i++) {
                if (i < past.length) {
                    newFuture.push(past[i]);
                } else {
                    newFuture.push(future[i - past.length]);
                }
            }
            
            return {
                past: newPast,
                present: targetState,
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
