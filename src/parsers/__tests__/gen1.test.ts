import { describe, expect, it } from "vitest";

import { Gen1PokemonObject, transformPokemon } from "../gen1";

const duplicateIvPokemon: Gen1PokemonObject = {
    entriesUsed: 2,
    speciesList: ["Beedrill", "Beedrill"],
    pokemonList: [
        {
            species: "Beedrill",
            level: 65,
            type1: "Bug",
            type2: "Poison",
            moves: ["Twineedle"],
            id: "4242",
        },
        {
            species: "Beedrill",
            level: 18,
            type1: "Bug",
            type2: "Poison",
            moves: ["Fury Attack"],
            id: "4242",
        },
    ],
    pokemonNames: ["Buzz", "Buzz Jr"],
};

describe("Gen 1 parser Pokemon IDs", () => {
    it("deduplicates repeated IV-derived IDs in one imported list", () => {
        const pokemon = transformPokemon(duplicateIvPokemon, "Team");

        expect(pokemon.map((poke) => poke.id)).toEqual([
            "4242-sav",
            "4242-sav-1",
        ]);
    });

    it("keeps IDs unique across party and box imports", () => {
        const idTracker = new Map<string, number>();
        const partyPokemon = transformPokemon(
            {
                ...duplicateIvPokemon,
                pokemonList: [duplicateIvPokemon.pokemonList[0]],
                pokemonNames: [duplicateIvPokemon.pokemonNames[0]],
            },
            "Team",
            1,
            idTracker,
        );
        const boxedPokemon = transformPokemon(
            {
                ...duplicateIvPokemon,
                pokemonList: [duplicateIvPokemon.pokemonList[1]],
                pokemonNames: [duplicateIvPokemon.pokemonNames[1]],
            },
            "Boxed",
            2,
            idTracker,
        );

        expect([...partyPokemon, ...boxedPokemon].map((poke) => poke.id)).toEqual([
            "4242-sav",
            "4242-sav-1",
        ]);
    });
});
