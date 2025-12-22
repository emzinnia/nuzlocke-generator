import { Action } from "./action";
import { DiffEntry } from "reducers/editorHistory";

// Initialize history with the first state snapshot
export type INIT_EDITOR_HISTORY = "INIT_EDITOR_HISTORY";
export const INIT_EDITOR_HISTORY: INIT_EDITOR_HISTORY = "INIT_EDITOR_HISTORY";

export type initEditorHistory = (present: unknown) => Action<INIT_EDITOR_HISTORY, unknown>;
export const initEditorHistory = (
    present: unknown,
): Action<INIT_EDITOR_HISTORY, unknown> => {
    return {
        type: INIT_EDITOR_HISTORY,
        present,
    };
};

// Update history with forward and backward diffs (not full state snapshots)
export type UPDATE_EDITOR_HISTORY = "UPDATE_EDITOR_HISTORY";
export const UPDATE_EDITOR_HISTORY: UPDATE_EDITOR_HISTORY = "UPDATE_EDITOR_HISTORY";

export interface UpdateEditorHistoryAction
    extends Action<UPDATE_EDITOR_HISTORY, DiffEntry> {
    // Forward diff: changes to go from previous state to new state
    forwardDiff: DiffEntry;
    // Backward diff: changes to go from new state back to previous state
    backwardDiff: DiffEntry;
    // The new state (kept for updating present, but not stored in history entries)
    newState: unknown;
}

export type updateEditorHistory = (
    forwardDiff: DiffEntry,
    backwardDiff: DiffEntry,
    newState: unknown,
) => UpdateEditorHistoryAction;
export const updateEditorHistory = (
    forwardDiff: DiffEntry,
    backwardDiff: DiffEntry,
    newState: unknown,
): UpdateEditorHistoryAction => {
    return {
        type: UPDATE_EDITOR_HISTORY,
        forwardDiff,
        backwardDiff,
        newState,
    };
};

// Undo - no longer needs the present state passed in
export type UNDO_EDITOR_HISTORY = "UNDO_EDITOR_HISTORY";
export const UNDO_EDITOR_HISTORY: UNDO_EDITOR_HISTORY = "UNDO_EDITOR_HISTORY";

export type undoEditorHistory = () => Action<UNDO_EDITOR_HISTORY, void>;
export const undoEditorHistory = (): Action<UNDO_EDITOR_HISTORY, void> => {
    return {
        type: UNDO_EDITOR_HISTORY,
    };
};

// Redo - no longer needs the present state passed in
export type REDO_EDITOR_HISTORY = "REDO_EDITOR_HISTORY";
export const REDO_EDITOR_HISTORY: REDO_EDITOR_HISTORY = "REDO_EDITOR_HISTORY";

export type redoEditorHistory = () => Action<REDO_EDITOR_HISTORY, void>;
export const redoEditorHistory = (): Action<REDO_EDITOR_HISTORY, void> => {
    return {
        type: REDO_EDITOR_HISTORY,
    };
};

// Jump to a specific history state by index
export type JUMP_TO_HISTORY_STATE = "JUMP_TO_HISTORY_STATE";
export const JUMP_TO_HISTORY_STATE: JUMP_TO_HISTORY_STATE = "JUMP_TO_HISTORY_STATE";

export type jumpToHistoryState = (index: number) => Action<JUMP_TO_HISTORY_STATE, number>;
export const jumpToHistoryState = (index: number): Action<JUMP_TO_HISTORY_STATE, number> => {
    return {
        type: JUMP_TO_HISTORY_STATE,
        index,
    };
};
