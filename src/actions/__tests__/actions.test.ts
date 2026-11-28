import {
    addHistoryEntry,
    ADD_HISTORY_ENTRY,
    addPokemon,
    ADD_POKEMON,
    changeEditorSize,
    CHANGE_EDITOR_SIZE,
    deletePokemon,
    DELETE_POKEMON,
    switchNuzlocke,
    SWITCH_NUZLOCKE,
    newNuzlocke,
    NEW_NUZLOCKE,
    deleteNuzlocke,
    DELETE_NUZLOCKE,
    addRule,
    ADD_RULE,
    deleteRule,
    DELETE_RULE,
    editRule,
    EDIT_RULE,
    modifyDeletionConfirmation,
    MODIFY_DELETION_CONFIRMATION,
    replaceState,
    REPLACE_STATE,
    resetRules,
    RESET_RULES,
    seeRelease,
    SEE_RELEASE,
    selectPokemon,
    SELECT_POKEMON,
} from "..";
import { Pokemon } from "models";

describe("actions", () => {
    test("#addPokemon", () => {
        const pokemon: Pokemon = {
            id: "0",
            species: "Testmon",
            nickname: "This is a test",
        };
        expect(addPokemon(pokemon)).toEqual({
            type: ADD_POKEMON,
            pokemon,
        });
    });

    test("#changeEditorSize", () => {
        const mode = true;
        expect(changeEditorSize(mode)).toEqual({
            type: CHANGE_EDITOR_SIZE,
            mode,
        });
    });

    test("#deletePokemon", () => {
        const id = "001";
        expect(deletePokemon(id)).toEqual({
            type: DELETE_POKEMON,
            id,
        });
    });

    test("#deleteNuzlocke", () => {
        const tid = "001";
        expect(deleteNuzlocke(tid)).toEqual({
            type: DELETE_NUZLOCKE,
            id: tid,
        });
    });

    describe("rules", () => {
        test("#addRule", () => {
            expect(addRule()).toEqual({
                type: ADD_RULE,
            });
        });

        test("#deleteRule", () => {
            const target = 1;
            expect(deleteRule(target)).toEqual({
                type: DELETE_RULE,
                target,
            });
        });

        test("#restRules", () => {
            expect(resetRules()).toEqual({ type: RESET_RULES });
        });
    });
});
