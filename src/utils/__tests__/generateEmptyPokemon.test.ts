import { describe, expect, it } from "vitest";
import {
    generateEmptyPokemon,
    getNextPokemonPosition,
} from "../generateEmptyPokemon";
import { Pokemon } from "models";

const poke = (position: number, status = "Team"): Pokemon =>
    ({
        id: `id-${position}`,
        species: "Bulbasaur",
        position,
        status,
    }) as Pokemon;

describe("getNextPokemonPosition", () => {
    it("returns 0 for an empty list", () => {
        expect(getNextPokemonPosition([])).toBe(0);
        expect(getNextPokemonPosition(undefined)).toBe(0);
    });

    it("uses max(position)+1 so gaps from deletions do not collide", () => {
        // length is 3, but max position is 5 — length-based allocation would collide
        expect(getNextPokemonPosition([poke(3), poke(4), poke(5)])).toBe(6);
        expect(getNextPokemonPosition([poke(0), poke(2), poke(5)])).toBe(6);
    });

    it("does not mutate the input array order", () => {
        const pokemon = [poke(2), poke(0), poke(1)];
        const before = pokemon.map((p) => p.id);
        getNextPokemonPosition(pokemon);
        expect(pokemon.map((p) => p.id)).toEqual(before);
    });
});

describe("generateEmptyPokemon", () => {
    it("does not mutate the source pokemon array when allocating position", () => {
        const pokemon = [poke(2), poke(0), poke(1)];
        const before = pokemon.map((p) => p.id);
        const created = generateEmptyPokemon(pokemon);
        expect(pokemon.map((p) => p.id)).toEqual(before);
        expect(created.position).toBe(3);
    });

    it("boxes new pokemon when the team already has 6 members", () => {
        const team = Array.from({ length: 6 }, (_, i) => poke(i, "Team"));
        expect(generateEmptyPokemon(team).status).toBe("Boxed");
    });
});
