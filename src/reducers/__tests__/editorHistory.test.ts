/* eslint-disable @typescript-eslint/no-explicit-any */
import { diff } from "deep-diff";
import {
    editorHistory,
    History,
    HistoryEntry,
    DiffEntry,
    reconstructPreviousState,
    reconstructNextState,
    reconstructStateAtIndex,
} from "../editorHistory";
import {
    INIT_EDITOR_HISTORY,
    UPDATE_EDITOR_HISTORY,
    UNDO_EDITOR_HISTORY,
    REDO_EDITOR_HISTORY,
    REPLACE_STATE,
    JUMP_TO_HISTORY_STATE,
} from "actions";

// Helper to create forward and backward diffs
function createDiffs(oldState: any, newState: any): { forwardDiff: DiffEntry; backwardDiff: DiffEntry } {
    const forwardDiff = diff(oldState, newState) as DiffEntry;
    const backwardDiff = diff(newState, oldState) as DiffEntry;
    return { forwardDiff, backwardDiff };
}

// Helper to create a history entry from two states
function createHistoryEntry(oldState: any, newState: any): HistoryEntry {
    const { forwardDiff, backwardDiff } = createDiffs(oldState, newState);
    return { forwardDiff, backwardDiff };
}

describe("editorHistory reducer", () => {
    const initialState: History<any> = {
        past: [],
        present: undefined,
        future: [],
        lastRevisionType: "update",
    };

    describe("INIT_EDITOR_HISTORY", () => {
        it("initializes history with the first state snapshot", () => {
            const state = { pokemon: [{ name: "Pikachu" }] };
            const result = editorHistory(initialState, {
                type: INIT_EDITOR_HISTORY,
                present: state,
            });

            expect(result.present).toEqual(state);
            expect(result.past).toEqual([]);
            expect(result.future).toEqual([]);
            expect(result.lastRevisionType).toBe("load");
        });
    });

    describe("UPDATE_EDITOR_HISTORY", () => {
        it("stores the first state when present is null", () => {
            const newState = { pokemon: [{ name: "Pikachu" }] };
            const { forwardDiff, backwardDiff } = createDiffs({}, newState);

            const result = editorHistory(initialState, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff,
                backwardDiff,
                newState,
            });

            expect(result.present).toEqual(newState);
            expect(result.past).toEqual([]);
            expect(result.lastRevisionType).toBe("update");
        });

        it("creates a history entry with diffs when state changes", () => {
            const oldState = { pokemon: [{ name: "Pikachu" }] };
            const newState = { pokemon: [{ name: "Pikachu" }, { name: "Charmander" }] };
            const { forwardDiff, backwardDiff } = createDiffs(oldState, newState);

            const stateWithPresent: History<any> = {
                past: [],
                present: oldState,
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(stateWithPresent, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff,
                backwardDiff,
                newState,
            });

            expect(result.present).toEqual(newState);
            expect(result.past.length).toBe(1);
            expect(result.past[0].forwardDiff).toEqual(forwardDiff);
            expect(result.past[0].backwardDiff).toEqual(backwardDiff);
            expect(result.future).toEqual([]);
        });

        it("does not create entry when diff is empty", () => {
            const state = { pokemon: [{ name: "Pikachu" }] };
            const stateWithPresent: History<any> = {
                past: [],
                present: state,
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(stateWithPresent, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff: [],
                backwardDiff: [],
                newState: state,
            });

            expect(result).toBe(stateWithPresent); // Should return same object
        });

        it("clears future on new changes", () => {
            const state1 = { pokemon: [{ name: "Pikachu" }] };
            const state2 = { pokemon: [{ name: "Charmander" }] };
            const state3 = { pokemon: [{ name: "Squirtle" }] };
            const futureEntry = createHistoryEntry(state1, state2);

            const stateWithFuture: History<any> = {
                past: [],
                present: state1,
                future: [futureEntry],
                lastRevisionType: "undo",
            };

            const { forwardDiff, backwardDiff } = createDiffs(state1, state3);
            const result = editorHistory(stateWithFuture, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff,
                backwardDiff,
                newState: state3,
            });

            expect(result.future).toEqual([]);
        });

        it("limits history to MAX_HISTORY_LENGTH (50)", () => {
            // Create a state with 50 past entries
            const baseState = { count: 0 };
            const entries: HistoryEntry[] = [];
            for (let i = 0; i < 50; i++) {
                entries.push(createHistoryEntry({ count: i }, { count: i + 1 }));
            }

            const fullHistory: History<any> = {
                past: entries,
                present: { count: 50 },
                future: [],
                lastRevisionType: "update",
            };

            const newState = { count: 51 };
            const { forwardDiff, backwardDiff } = createDiffs({ count: 50 }, newState);

            const result = editorHistory(fullHistory, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff,
                backwardDiff,
                newState,
            });

            expect(result.past.length).toBe(50); // Still 50, not 51
            expect(result.present).toEqual(newState);
        });
    });

    describe("UNDO_EDITOR_HISTORY", () => {
        it("does nothing when past is empty", () => {
            const state: History<any> = {
                past: [],
                present: { count: 1 },
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(state, { type: UNDO_EDITOR_HISTORY });
            expect(result).toBe(state);
        });

        it("does nothing when present is null", () => {
            const result = editorHistory(initialState, { type: UNDO_EDITOR_HISTORY });
            expect(result).toBe(initialState);
        });

        it("moves last past entry to future and reconstructs previous state", () => {
            const state1 = { pokemon: [{ name: "Pikachu" }] };
            const state2 = { pokemon: [{ name: "Pikachu" }, { name: "Charmander" }] };
            const entry = createHistoryEntry(state1, state2);

            const state: History<any> = {
                past: [entry],
                present: state2,
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(state, { type: UNDO_EDITOR_HISTORY });

            expect(result.past).toEqual([]);
            expect(result.present).toEqual(state1);
            expect(result.future.length).toBe(1);
            expect(result.future[0]).toBe(entry);
            expect(result.lastRevisionType).toBe("undo");
        });

        it("correctly handles multiple undos", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const state3 = { count: 3 };
            const entry1 = createHistoryEntry(state1, state2);
            const entry2 = createHistoryEntry(state2, state3);

            let state: History<any> = {
                past: [entry1, entry2],
                present: state3,
                future: [],
                lastRevisionType: "update",
            };

            // First undo
            state = editorHistory(state, { type: UNDO_EDITOR_HISTORY });
            expect(state.present).toEqual(state2);
            expect(state.past.length).toBe(1);
            expect(state.future.length).toBe(1);

            // Second undo
            state = editorHistory(state, { type: UNDO_EDITOR_HISTORY });
            expect(state.present).toEqual(state1);
            expect(state.past.length).toBe(0);
            expect(state.future.length).toBe(2);
        });
    });

    describe("REDO_EDITOR_HISTORY", () => {
        it("does nothing when future is empty", () => {
            const state: History<any> = {
                past: [],
                present: { count: 1 },
                future: [],
                lastRevisionType: "undo",
            };

            const result = editorHistory(state, { type: REDO_EDITOR_HISTORY });
            expect(result).toBe(state);
        });

        it("moves first future entry to past and reconstructs next state", () => {
            const state1 = { pokemon: [{ name: "Pikachu" }] };
            const state2 = { pokemon: [{ name: "Pikachu" }, { name: "Charmander" }] };
            const entry = createHistoryEntry(state1, state2);

            const state: History<any> = {
                past: [],
                present: state1,
                future: [entry],
                lastRevisionType: "undo",
            };

            const result = editorHistory(state, { type: REDO_EDITOR_HISTORY });

            expect(result.past.length).toBe(1);
            expect(result.past[0]).toBe(entry);
            expect(result.present).toEqual(state2);
            expect(result.future).toEqual([]);
            expect(result.lastRevisionType).toBe("redo");
        });

        it("correctly handles multiple redos", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const state3 = { count: 3 };
            const entry1 = createHistoryEntry(state1, state2);
            const entry2 = createHistoryEntry(state2, state3);

            let state: History<any> = {
                past: [],
                present: state1,
                future: [entry1, entry2],
                lastRevisionType: "undo",
            };

            // First redo
            state = editorHistory(state, { type: REDO_EDITOR_HISTORY });
            expect(state.present).toEqual(state2);
            expect(state.past.length).toBe(1);
            expect(state.future.length).toBe(1);

            // Second redo
            state = editorHistory(state, { type: REDO_EDITOR_HISTORY });
            expect(state.present).toEqual(state3);
            expect(state.past.length).toBe(2);
            expect(state.future.length).toBe(0);
        });
    });

    describe("JUMP_TO_HISTORY_STATE", () => {
        it("does nothing when jumping to current index", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const entry = createHistoryEntry(state1, state2);

            const state: History<any> = {
                past: [entry],
                present: state2,
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(state, { type: JUMP_TO_HISTORY_STATE, index: 1 });
            expect(result).toBe(state);
        });

        it("jumps backward in history", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const state3 = { count: 3 };
            const entry1 = createHistoryEntry(state1, state2);
            const entry2 = createHistoryEntry(state2, state3);

            const state: History<any> = {
                past: [entry1, entry2],
                present: state3,
                future: [],
                lastRevisionType: "update",
            };

            // Jump to index 0 (state1)
            const result = editorHistory(state, { type: JUMP_TO_HISTORY_STATE, index: 0 });

            expect(result.present).toEqual(state1);
            expect(result.past.length).toBe(0);
            expect(result.future.length).toBe(2);
            expect(result.lastRevisionType).toBe("undo");
        });

        it("jumps forward in history (to future)", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const state3 = { count: 3 };
            const entry1 = createHistoryEntry(state1, state2);
            const entry2 = createHistoryEntry(state2, state3);

            const state: History<any> = {
                past: [],
                present: state1,
                future: [entry1, entry2],
                lastRevisionType: "undo",
            };

            // Jump to index 2 (state3)
            const result = editorHistory(state, { type: JUMP_TO_HISTORY_STATE, index: 2 });

            expect(result.present).toEqual(state3);
            expect(result.past.length).toBe(2);
            expect(result.future.length).toBe(0);
            expect(result.lastRevisionType).toBe("redo");
        });
    });

    describe("REPLACE_STATE", () => {
        it("resets history to initial state", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const entry = createHistoryEntry(state1, state2);

            const state: History<any> = {
                past: [entry],
                present: state2,
                future: [],
                lastRevisionType: "update",
            };

            const result = editorHistory(state, { type: REPLACE_STATE, replaceWith: {} });

            expect(result.past).toEqual([]);
            expect(result.present).toBeUndefined();
            expect(result.future).toEqual([]);
        });
    });

    describe("helper functions", () => {
        describe("reconstructPreviousState", () => {
            it("reconstructs previous state using backward diff", () => {
                const state1 = { pokemon: [{ name: "Pikachu" }] };
                const state2 = { pokemon: [{ name: "Pikachu" }, { name: "Charmander" }] };
                const entry = createHistoryEntry(state1, state2);

                const reconstructed = reconstructPreviousState(state2, entry);
                expect(reconstructed).toEqual(state1);
            });
        });

        describe("reconstructNextState", () => {
            it("reconstructs next state using forward diff", () => {
                const state1 = { pokemon: [{ name: "Pikachu" }] };
                const state2 = { pokemon: [{ name: "Pikachu" }, { name: "Charmander" }] };
                const entry = createHistoryEntry(state1, state2);

                const reconstructed = reconstructNextState(state1, entry);
                expect(reconstructed).toEqual(state2);
            });
        });

        describe("reconstructStateAtIndex", () => {
            it("returns present when index equals past.length", () => {
                const state1 = { count: 1 };
                const state2 = { count: 2 };
                const entry = createHistoryEntry(state1, state2);

                const history: History<any> = {
                    past: [entry],
                    present: state2,
                    future: [],
                    lastRevisionType: "update",
                };

                const result = reconstructStateAtIndex(history, 1);
                expect(result).toEqual(state2);
            });

            it("reconstructs past state by applying backward diffs", () => {
                const state1 = { count: 1 };
                const state2 = { count: 2 };
                const state3 = { count: 3 };
                const entry1 = createHistoryEntry(state1, state2);
                const entry2 = createHistoryEntry(state2, state3);

                const history: History<any> = {
                    past: [entry1, entry2],
                    present: state3,
                    future: [],
                    lastRevisionType: "update",
                };

                // Reconstruct state at index 0 (state1)
                const result = reconstructStateAtIndex(history, 0);
                expect(result).toEqual(state1);

                // Reconstruct state at index 1 (state2)
                const result2 = reconstructStateAtIndex(history, 1);
                expect(result2).toEqual(state2);
            });

            it("reconstructs future state by applying forward diffs", () => {
                const state1 = { count: 1 };
                const state2 = { count: 2 };
                const state3 = { count: 3 };
                const entry1 = createHistoryEntry(state1, state2);
                const entry2 = createHistoryEntry(state2, state3);

                const history: History<any> = {
                    past: [],
                    present: state1,
                    future: [entry1, entry2],
                    lastRevisionType: "undo",
                };

                // Reconstruct state at index 1 (state2)
                const result = reconstructStateAtIndex(history, 1);
                expect(result).toEqual(state2);

                // Reconstruct state at index 2 (state3)
                const result2 = reconstructStateAtIndex(history, 2);
                expect(result2).toEqual(state3);
            });

            it("returns undefined when present is null", () => {
                const history: History<any> = {
                    past: [],
                    present: undefined,
                    future: [],
                    lastRevisionType: "update",
                };

                const result = reconstructStateAtIndex(history, 0);
                expect(result).toBeUndefined();
            });
        });
    });

    describe("complex scenarios", () => {
        it("handles undo followed by new edit (clears redo stack)", () => {
            const state1 = { count: 1 };
            const state2 = { count: 2 };
            const state3 = { count: 3 };
            const entry1 = createHistoryEntry(state1, state2);

            let history: History<any> = {
                past: [entry1],
                present: state2,
                future: [],
                lastRevisionType: "update",
            };

            // Undo back to state1
            history = editorHistory(history, { type: UNDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state1);
            expect(history.future.length).toBe(1);

            // New edit to state3
            const { forwardDiff, backwardDiff } = createDiffs(state1, state3);
            history = editorHistory(history, {
                type: UPDATE_EDITOR_HISTORY,
                forwardDiff,
                backwardDiff,
                newState: state3,
            });

            expect(history.present).toEqual(state3);
            expect(history.past.length).toBe(1);
            expect(history.future.length).toBe(0); // Future cleared
        });

        it("handles nested object changes correctly", () => {
            const state1 = {
                trainer: { name: "Ash", badges: 0 },
                pokemon: [{ name: "Pikachu", level: 5 }],
            };
            const state2 = {
                trainer: { name: "Ash", badges: 1 },
                pokemon: [{ name: "Pikachu", level: 10 }],
            };

            const entry = createHistoryEntry(state1, state2);

            let history: History<any> = {
                past: [entry],
                present: state2,
                future: [],
                lastRevisionType: "update",
            };

            // Undo
            history = editorHistory(history, { type: UNDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state1);
            expect(history.present.trainer.badges).toBe(0);
            expect(history.present.pokemon[0].level).toBe(5);

            // Redo
            history = editorHistory(history, { type: REDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state2);
            expect(history.present.trainer.badges).toBe(1);
            expect(history.present.pokemon[0].level).toBe(10);
        });

        it("handles array element removal and addition", () => {
            const state1 = { pokemon: ["Pikachu", "Charmander", "Squirtle"] };
            const state2 = { pokemon: ["Pikachu", "Squirtle"] }; // Removed Charmander
            const state3 = { pokemon: ["Pikachu", "Squirtle", "Bulbasaur"] }; // Added Bulbasaur

            const entry1 = createHistoryEntry(state1, state2);
            const entry2 = createHistoryEntry(state2, state3);

            let history: History<any> = {
                past: [entry1, entry2],
                present: state3,
                future: [],
                lastRevisionType: "update",
            };

            // Undo twice to get back to state1
            history = editorHistory(history, { type: UNDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state2);

            history = editorHistory(history, { type: UNDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state1);
            expect(history.present.pokemon).toContain("Charmander");

            // Redo twice to get back to state3
            history = editorHistory(history, { type: REDO_EDITOR_HISTORY });
            history = editorHistory(history, { type: REDO_EDITOR_HISTORY });
            expect(history.present).toEqual(state3);
            expect(history.present.pokemon).toContain("Bulbasaur");
            expect(history.present.pokemon).not.toContain("Charmander");
        });
    });
});


