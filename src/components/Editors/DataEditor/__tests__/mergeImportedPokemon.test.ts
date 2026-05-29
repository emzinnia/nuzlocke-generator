import { describe, expect, it } from "vitest";
import { Pokemon } from "models";
import { mergeImportedPokemon } from "../mergeImportedPokemon";

const pokemon = (overrides: Partial<Pokemon>): Pokemon =>
    ({
        id: "pokemon-id",
        nickname: "Pikachu",
        species: "Pikachu",
        status: "Team",
        checkpoints: [],
        ...overrides,
    }) as Pokemon;

describe("mergeImportedPokemon", () => {
    it("preserves current Pokemon that are not present in the save import", () => {
        const manualPokemon = pokemon({
            id: "manual-entry",
            nickname: "Manual notes",
            notes: "keep this tracked encounter",
        });
        const importedPokemon = pokemon({
            id: "save-entry",
            nickname: "Imported",
            species: "Bulbasaur",
        });

        expect(mergeImportedPokemon([manualPokemon], [importedPokemon])).toEqual([
            manualPokemon,
            importedPokemon,
        ]);
    });

    it("overlays imported save data on matching Pokemon without dropping local fields", () => {
        const currentPokemon = pokemon({
            id: "same-entry",
            nickname: "Before import",
            notes: "keep notes",
            level: 5,
        });
        const importedPokemon = pokemon({
            id: "same-entry",
            nickname: "After import",
            level: 12,
        });

        expect(mergeImportedPokemon([currentPokemon], [importedPokemon])).toEqual([
            {
                ...currentPokemon,
                ...importedPokemon,
                notes: "keep notes",
            },
        ]);
    });
});
