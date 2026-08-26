import { describe, expect, it } from "vitest";
import { buildPokemonIconSwapEdits } from "../PokemonIcon";

describe("buildPokemonIconSwapEdits", () => {
    const teamMon = {
        id: "team-1",
        position: 1,
        status: "Team",
    };
    const boxedMon = {
        id: "boxed-1",
        position: 7,
        status: "Boxed",
    };

    it("swaps position and status when both sides are complete", () => {
        expect(buildPokemonIconSwapEdits(boxedMon, teamMon)).toEqual({
            targetId: "boxed-1",
            targetEdits: { position: 1, status: "Team" },
            sourceId: "team-1",
            sourceEdits: { position: 7, status: "Boxed" },
        });
    });

    it("refuses to swap when the drop target omits status (BoxedPokemon bug)", () => {
        // Dropping a Team mon onto a Boxed icon that forgot to pass status
        // previously wrote status: undefined and orphaned the Team mon.
        expect(
            buildPokemonIconSwapEdits(
                { id: "boxed-1", position: 7, status: undefined },
                teamMon,
            ),
        ).toBeNull();
    });

    it("refuses to swap when the dragged item omits status", () => {
        expect(
            buildPokemonIconSwapEdits(teamMon, {
                id: "boxed-1",
                position: 7,
                status: undefined,
            }),
        ).toBeNull();
    });

    it("refuses to swap when position is missing", () => {
        expect(
            buildPokemonIconSwapEdits(
                { id: "a", position: undefined, status: "Team" },
                boxedMon,
            ),
        ).toBeNull();
    });

    it("refuses to swap a mon with itself", () => {
        expect(buildPokemonIconSwapEdits(teamMon, teamMon)).toBeNull();
    });
});
