import { describe, it, expect } from "vitest";
import { getNextPokemonPosition } from "../generateEmptyPokemon";
import type { Pokemon } from "models";

describe("getNextPokemonPosition", () => {
    it("returns 0 for an empty list", () => {
        expect(getNextPokemonPosition([])).toBe(0);
        expect(getNextPokemonPosition(undefined)).toBe(0);
    });

    it("returns max(position)+1 even when positions have gaps", () => {
        const pokemon = [
            { position: 0 },
            { position: 2 },
            { position: 5 },
        ] as Pokemon[];

        expect(getNextPokemonPosition(pokemon)).toBe(6);
    });

    it("does not collide with an existing neighbor at position+1", () => {
        // Copying the mon at position 0 used to assign position 1, colliding
        // with the existing mon already at 1.
        const pokemon = [
            { position: 0 },
            { position: 1 },
            { position: 2 },
        ] as Pokemon[];

        expect(getNextPokemonPosition(pokemon)).toBe(3);
    });
});
