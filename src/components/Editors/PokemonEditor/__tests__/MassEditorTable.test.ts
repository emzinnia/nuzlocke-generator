import { describe, expect, it } from "vitest";
import { coerceMassEditorValue, sortPokemonForMassEditor } from "../MassEditorTable";
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

describe("coerceMassEditorValue", () => {
    it("parses boolean false strings as false (not truthy strings)", () => {
        expect(coerceMassEditorValue("shiny", "false")).toBe(false);
        expect(coerceMassEditorValue("egg", "no")).toBe(false);
        expect(coerceMassEditorValue("hidden", "0")).toBe(false);
        expect(coerceMassEditorValue("mvp", "")).toBe(false);
        expect(coerceMassEditorValue("gift", "FALSE")).toBe(false);
    });

    it("parses boolean true strings as true", () => {
        expect(coerceMassEditorValue("shiny", "true")).toBe(true);
        expect(coerceMassEditorValue("alpha", "yes")).toBe(true);
        expect(coerceMassEditorValue("champion", "1")).toBe(true);
    });

    it("parses numeric fields as numbers", () => {
        expect(coerceMassEditorValue("level", "50")).toBe(50);
        expect(coerceMassEditorValue("metLevel", "5")).toBe(5);
        expect(coerceMassEditorValue("position", "12")).toBe(12);
        expect(coerceMassEditorValue("level", "")).toBeUndefined();
        expect(coerceMassEditorValue("level", "abc")).toBeUndefined();
    });

    it("splits moves and types on commas", () => {
        expect(coerceMassEditorValue("moves", "Tackle, Growl")).toEqual([
            "Tackle",
            "Growl",
        ]);
        expect(coerceMassEditorValue("types", "Fire, Flying")).toEqual([
            "Fire",
            "Flying",
        ]);
    });

    it("leaves plain string fields as strings", () => {
        expect(coerceMassEditorValue("species", "Pikachu")).toBe("Pikachu");
        expect(coerceMassEditorValue("nickname", "Sparky")).toBe("Sparky");
    });
});
