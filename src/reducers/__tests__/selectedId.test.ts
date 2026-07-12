import { describe, expect, it } from "vitest";
import { replaceState, selectPokemon, syncStateFromHistory } from "actions";
import { Pokemon } from "models";
import { selectedId } from "../selectedId";
import { generateEmptyPokemon } from "utils";

const createPokemon = (id: string): Pokemon =>
    generateEmptyPokemon(undefined, { id });

describe("selectedId reducer", () => {
    it("selects a valid restored Pokemon when replacing state", () => {
        expect(
            selectedId(
                "deleted-pokemon",
                replaceState({
                    selectedId: "missing-pokemon",
                    pokemon: [createPokemon("restored-pokemon")],
                }),
            ),
        ).toBe("restored-pokemon");
    });

    it("preserves a valid selected Pokemon from history sync", () => {
        expect(
            selectedId(
                "old-pokemon",
                syncStateFromHistory({
                    selectedId: "restored-pokemon",
                    pokemon: [
                        createPokemon("old-pokemon"),
                        createPokemon("restored-pokemon"),
                    ],
                }),
            ),
        ).toBe("restored-pokemon");
    });

    it("handles explicit Pokemon selection", () => {
        expect(selectedId("", selectPokemon("chosen-pokemon"))).toBe(
            "chosen-pokemon",
        );
    });
});
