import { create } from 'zustand';
import type { State } from '../state';

const MAX_HISTORY_SIZE = 50;

interface HistoryEntry {
    data: Partial<State>;
    timestamp: number;
}

interface RunHistory {
    undoStack: HistoryEntry[];
    redoStack: HistoryEntry[];
}

interface UndoRedoState {
    history: Record<string, RunHistory>;
    
    // Push current state to undo stack before making a change
    pushState: (runId: string, state: Partial<State>) => void;
    
    // Undo: pop from undo stack, return state to restore
    undo: (runId: string, currentState: Partial<State>) => Partial<State> | null;
    
    // Redo: pop from redo stack, return state to restore
    redo: (runId: string, currentState: Partial<State>) => Partial<State> | null;
    
    // Check if undo/redo is available
    canUndo: (runId: string) => boolean;
    canRedo: (runId: string) => boolean;
    
    // Get stack sizes for UI
    getUndoCount: (runId: string) => number;
    getRedoCount: (runId: string) => number;
    
    // Clear history for a run
    clearHistory: (runId: string) => void;
}

const getOrCreateHistory = (history: Record<string, RunHistory>, runId: string): RunHistory => {
    return history[runId] || { undoStack: [], redoStack: [] };
};

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
    history: {},

    pushState: (runId: string, state: Partial<State>) => {
        set((prev) => {
            const runHistory = getOrCreateHistory(prev.history, runId);
            const newUndoStack = [
                ...runHistory.undoStack,
                { data: structuredClone(state), timestamp: Date.now() }
            ];
            
            // Limit stack size
            if (newUndoStack.length > MAX_HISTORY_SIZE) {
                newUndoStack.shift();
            }
            
            return {
                history: {
                    ...prev.history,
                    [runId]: {
                        undoStack: newUndoStack,
                        redoStack: [], // Clear redo stack on new change
                    },
                },
            };
        });
    },

    undo: (runId: string, currentState: Partial<State>) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        
        if (runHistory.undoStack.length === 0) {
            return null;
        }
        
        const previousEntry = runHistory.undoStack[runHistory.undoStack.length - 1];
        const newUndoStack = runHistory.undoStack.slice(0, -1);
        
        // Push current state to redo stack
        const newRedoStack = [
            ...runHistory.redoStack,
            { data: structuredClone(currentState), timestamp: Date.now() }
        ];
        
        // Limit redo stack size
        if (newRedoStack.length > MAX_HISTORY_SIZE) {
            newRedoStack.shift();
        }
        
        set({
            history: {
                ...history,
                [runId]: {
                    undoStack: newUndoStack,
                    redoStack: newRedoStack,
                },
            },
        });
        
        return previousEntry.data;
    },

    redo: (runId: string, currentState: Partial<State>) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        
        if (runHistory.redoStack.length === 0) {
            return null;
        }
        
        const nextEntry = runHistory.redoStack[runHistory.redoStack.length - 1];
        const newRedoStack = runHistory.redoStack.slice(0, -1);
        
        // Push current state to undo stack
        const newUndoStack = [
            ...runHistory.undoStack,
            { data: structuredClone(currentState), timestamp: Date.now() }
        ];
        
        // Limit undo stack size
        if (newUndoStack.length > MAX_HISTORY_SIZE) {
            newUndoStack.shift();
        }
        
        set({
            history: {
                ...history,
                [runId]: {
                    undoStack: newUndoStack,
                    redoStack: newRedoStack,
                },
            },
        });
        
        return nextEntry.data;
    },

    canUndo: (runId: string) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        return runHistory.undoStack.length > 0;
    },

    canRedo: (runId: string) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        return runHistory.redoStack.length > 0;
    },

    getUndoCount: (runId: string) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        return runHistory.undoStack.length;
    },

    getRedoCount: (runId: string) => {
        const { history } = get();
        const runHistory = getOrCreateHistory(history, runId);
        return runHistory.redoStack.length;
    },

    clearHistory: (runId: string) => {
        set((prev) => ({
            history: {
                ...prev.history,
                [runId]: { undoStack: [], redoStack: [] },
            },
        }));
    },
}));

// Hook for components to use
export function useUndoRedo(runId: string | undefined) {
    const store = useUndoRedoStore();
    
    if (!runId) {
        return {
            pushState: () => {},
            undo: () => null,
            redo: () => null,
            canUndo: false,
            canRedo: false,
            undoCount: 0,
            redoCount: 0,
            clearHistory: () => {},
        };
    }
    
    return {
        pushState: (state: Partial<State>) => store.pushState(runId, state),
        undo: (currentState: Partial<State>) => store.undo(runId, currentState),
        redo: (currentState: Partial<State>) => store.redo(runId, currentState),
        canUndo: store.canUndo(runId),
        canRedo: store.canRedo(runId),
        undoCount: store.getUndoCount(runId),
        redoCount: store.getRedoCount(runId),
        clearHistory: () => store.clearHistory(runId),
    };
}

