import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Buffer } from "buffer";
import { parseGen2Save, parsePokemonList } from "../gen2";
import type { BoxMappings } from "../utils/boxMappings";

const readParserFile = (name: string) =>
    readFileSync(join(process.cwd(), "src", "parsers", name));

type CaughtData = {
    timeOfDay?: string;
    level?: number;
    location?: string;
    otGender?: string;
};

const caughtOf = (pokemon: { extraData?: object } | undefined): CaughtData => {
    const extra = pokemon?.extraData as { caughtData?: CaughtData } | undefined;
    return extra?.caughtData ?? {};
};

const boxMappings: BoxMappings = Array.from({ length: 14 }, (_, index) => ({
    key: index + 1,
    status: "Boxed",
    name: `Box ${index + 1}`,
}));

const buildCaughtMon = (stride: number, species: number, caughtA: number, caughtB: number) => {
    const mon = Buffer.alloc(stride);
    mon[0x00] = species;
    mon[0x1d] = caughtA;
    mon[0x1e] = caughtB;
    mon[0x1f] = 10;
    return mon;
};

const buildList = (entries: number, stride: number, mon: Buffer) => {
    const speciesListEnd = 0x01 + entries + 1;
    const buf = Buffer.alloc(speciesListEnd + stride * entries);
    buf[0] = 1;
    buf[1] = mon[0];
    buf[2] = 0xff;
    mon.copy(buf, speciesListEnd);
    return buf;
};

describe("Gen 2 caught data", () => {
    it("decodes Crystal met level, time of day, location, and OT gender", () => {
        // Morning (bits 7–6 = 01), level 5, New Bark Town, female OT.
        // The old bit slice reported this starter as level 34 with no time of day.
        const morningStarter = buildCaughtMon(48, 0x98, 0x45, 0x81);
        const [starter] = parsePokemonList(buildList(6, 48, morningStarter)).pokemonList;

        expect(starter.species).toBe("Chikorita");
        expect(starter.metLevel).toBe(5);
        expect(starter.met).toBe("New Bark Town");
        expect(caughtOf(starter)).toMatchObject({
            timeOfDay: "morning",
            level: 5,
            location: "New Bark Town",
            otGender: "F",
        });

        // Day (bits 7–6 = 10), level 3, Route 29. Old decoder called this morning at level 1.
        const dayCatch = buildCaughtMon(48, 0xa3, 0x83, 0x02);
        const [hoothoot] = parsePokemonList(buildList(6, 48, dayCatch)).pokemonList;
        expect(hoothoot.metLevel).toBe(3);
        expect(hoothoot.met).toBe("Route 29");
        expect(caughtOf(hoothoot).timeOfDay).toBe("day");
    });

    it("resolves location ids by index instead of their hex text", () => {
        // Route 46 is 0x2D. Looking that up as the hex string "2D" misses the table.
        const route46 = buildCaughtMon(48, 0x4a, 0x42, 0x2d);
        const [geodude] = parsePokemonList(buildList(6, 48, route46)).pokemonList;
        expect(geodude.species).toBe("Geodude");
        expect(geodude.met).toBe("Route 46");
        expect(geodude.metLevel).toBe(2);

        // 0x10 is Goldenrod. The hex string "10" used to hit decimal key 10 (Union Cave).
        const goldenrod = buildCaughtMon(48, 0x10, 0x41, 0x10);
        const [pidgey] = parsePokemonList(buildList(6, 48, goldenrod)).pokemonList;
        expect(pidgey.met).toBe("Goldenrod City");
        expect(pidgey.metLevel).toBe(1);

        const unionCave = buildCaughtMon(48, 0x0a, 0x43, 0x0a);
        const [caterpie] = parsePokemonList(buildList(6, 48, unionCave)).pokemonList;
        expect(caterpie.met).toBe("Union Cave");
    });

    it("keeps caught data on boxed Pokémon and ignores an empty field", () => {
        const boxed = buildCaughtMon(32, 0x2a, 0xc2, 0x2d);
        const [golbat] = parsePokemonList(buildList(20, 32, boxed), 20).pokemonList;
        expect(golbat.species).toBe("Golbat");
        expect(golbat.met).toBe("Route 46");
        expect(golbat.metLevel).toBe(2);
        expect(caughtOf(golbat)).toMatchObject({
            timeOfDay: "night",
            otGender: "M",
        });

        const empty = buildCaughtMon(48, 0x19, 0x00, 0x00);
        const [pikachu] = parsePokemonList(buildList(6, 48, empty)).pokemonList;
        expect(pikachu.met).toBeUndefined();
        expect(pikachu.metLevel).toBeUndefined();
        expect(caughtOf(pikachu)).toEqual({
            level: undefined,
            timeOfDay: undefined,
            location: undefined,
            otGender: undefined,
        });
    });

    it("imports crystal.sav met data and leaves native Gold catches blank", async () => {
        const crystal = await parseGen2Save(readParserFile("crystal.sav"), {
            isCrystal: true,
            boxMappings,
        });
        const feraligatr = crystal.pokemon.find(
            (pokemon) => pokemon.species === "Feraligatr" && pokemon.status === "Team",
        );
        const steelix = crystal.pokemon.find(
            (pokemon) => pokemon.species === "Steelix" && pokemon.status === "Team",
        );
        const boxedGolbat = crystal.pokemon.find(
            (pokemon) => pokemon.species === "Golbat" && pokemon.status === "Boxed",
        );

        expect(feraligatr).toMatchObject({
            met: "New Bark Town",
            metLevel: 5,
        });
        expect(caughtOf(feraligatr).timeOfDay).toBe("morning");

        expect(steelix).toMatchObject({
            met: "Victory Road",
            metLevel: 33,
        });
        expect(caughtOf(steelix).timeOfDay).toBe("day");

        expect(boxedGolbat).toMatchObject({
            met: "Victory Road",
            metLevel: 34,
        });

        const gold = await parseGen2Save(readParserFile("gold.sav"), {
            isCrystal: false,
            boxMappings,
        });
        const fearow = gold.pokemon.find(
            (pokemon) => pokemon.species === "Fearow" && pokemon.status === "Team",
        );
        expect(fearow?.met).toBeUndefined();
        expect(fearow?.metLevel).toBeUndefined();
        expect(caughtOf(fearow).location).toBeUndefined();
    });
});
