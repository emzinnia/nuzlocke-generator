import { describe, expect, it } from "vitest";
import { sortPokemonForMassEditor } from "../MassEditorTable";
import type { Pokemon } from "models";
import { Types } from "utils";

const pokemon = [
    {
        id: "charlie",
        species: "Charizard",
        level: 36,
        types: [Types.Fire, Types.Flying],
    },
    {
        id: "bulby",
        species: "Bulbasaur",
        level: 5,
        types: [Types.Grass, Types.Poison],
    },
    {
        id: "squirt",
        species: "Squirtle",
        level: 5,
        types: [Types.Water, Types.Water],
    },
] as Pokemon[];

describe(sortPokemonForMassEditor.name, () => {
    it("keeps the input order when no sort is selected", () => {
        expect(sortPokemonForMassEditor(pokemon).map((poke) => poke.id)).toEqual([
            "charlie",
            "bulby",
            "squirt",
        ]);
    });

    it("sorts string fields ascending and descending", () => {
        expect(
            sortPokemonForMassEditor(pokemon, {
                key: "species",
                direction: "asc",
            }).map((poke) => poke.species),
        ).toEqual(["Bulbasaur", "Charizard", "Squirtle"]);

        expect(
            sortPokemonForMassEditor(pokemon, {
                key: "species",
                direction: "desc",
            }).map((poke) => poke.species),
        ).toEqual(["Squirtle", "Charizard", "Bulbasaur"]);
    });

    it("sorts number fields numerically", () => {
        expect(
            sortPokemonForMassEditor(pokemon, {
                key: "level",
                direction: "asc",
            }).map((poke) => poke.id),
        ).toEqual(["bulby", "squirt", "charlie"]);
    });
});
