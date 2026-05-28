import { describe, expect, it } from "vitest";
import {
    normalizeImportedJsonData,
    parsePkhexJsonPokemon,
} from "../pkhexJsonImport";

describe("PKHeX JSON imports", () => {
    const pkhexRows = [
        {
            Species: ":--:",
            Nickname: ":--:",
            Position: ":--:",
        },
        {
            Position:
                "4997 - Pokemon - Platinum Version (USA) (Rev 1).dsv @ [01] (BOX 1)-01: 156 - bun - DB0A30285DB3.pk4",
            Nickname: "bun",
            Species: "Quilava",
            Nature: "Calm",
            Gender: "M",
            Ability: "Blaze",
            Move1: "Lava Plume",
            Move2: "Defense Curl",
            Move3: "Reversal",
            Move4: "Ember",
            HeldItem: "Charcoal",
            MetLoc: "Floaroma Town",
            Ball: "Poké Ball",
            Version: "Platinum",
            Level: "32",
            MetLevel: "15",
            IsEgg: "False",
            IsShiny: "False",
        },
        {
            Position:
                "4997 - Pokemon - Platinum Version (USA) (Rev 1).dsv @ Party: 0: 400 ★ - simple???? - 2C8ABB08F7BA.pk4",
            Nickname: "simple????",
            Species: "Bibarel",
            Nature: "Careful",
            Gender: "M",
            Ability: "Simple",
            Move1: "Crunch",
            Move2: "Swords Dance",
            Move3: "Yawn",
            Move4: "Hyper Fang",
            HeldItem: "(None)",
            MetLoc: "Route 208",
            Ball: "Poké Ball",
            Version: "Platinum",
            Level: "31",
            MetLevel: "24",
            IsEgg: "False",
            IsShiny: "True",
        },
    ];

    it("converts PKHeX JSON rows into nuzlocke Pokemon", () => {
        const pokemon = parsePkhexJsonPokemon(pkhexRows);

        expect(pokemon).toHaveLength(2);
        expect(pokemon?.[0]).toMatchObject({
            species: "Quilava",
            nickname: "bun",
            status: "Boxed",
            level: 32,
            met: "Floaroma Town",
            metLevel: 15,
            nature: "Calm",
            ability: "Blaze",
            item: "Charcoal",
            pokeball: "Poké Ball",
            gameOfOrigin: "Platinum",
            gender: "Male",
            shiny: false,
            egg: false,
            moves: ["Lava Plume", "Defense Curl", "Reversal", "Ember"],
        });
        expect(pokemon?.[1]).toMatchObject({
            species: "Bibarel",
            nickname: "simple????",
            status: "Team",
            shiny: true,
            item: undefined,
        });
    });

    it("normalizes PKHeX arrays into importable state data", () => {
        expect(normalizeImportedJsonData(pkhexRows)).toMatchObject({
            pokemon: [
                { species: "Quilava", status: "Boxed" },
                { species: "Bibarel", status: "Team" },
            ],
        });
    });

    it("leaves unsupported JSON arrays unchanged", () => {
        const unsupported = [{ nope: true }];

        expect(normalizeImportedJsonData(unsupported)).toBe(unsupported);
    });
});
