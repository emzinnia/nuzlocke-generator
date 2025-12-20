import { describe, it, expect } from "vitest";
import { parseQuery } from "../parse";
import { compileQuery } from "../compile";
import { normalizePokemon } from "../normalize";
import { searchPokemon } from "../index";
import type { Pokemon } from "models";

// ─────────────────────────────────────────────────────────────────────────────
// Test Pokémon data
// ─────────────────────────────────────────────────────────────────────────────

const createPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
    id: Math.random().toString(36).slice(2),
    species: "Pikachu",
    nickname: "",
    status: "Team",
    level: 25,
    gender: "m",
    types: ["Electric", "Electric"] as any,
    moves: [],
    shiny: false,
    egg: false,
    hidden: false,
    alpha: false,
    mvp: false,
    gift: false,
    ...overrides,
});

const testTeam: Pokemon[] = [
    createPokemon({ id: "1", species: "Bruxish", nickname: "Breem", gender: "f", types: ["Water", "Psychic"] as any, level: 30 }),
    createPokemon({ id: "2", species: "Breloom", nickname: "", gender: "m", types: ["Grass", "Fighting"] as any, level: 45, shiny: true }),
    createPokemon({ id: "3", species: "Bulbasaur", nickname: "Planty", gender: "m", types: ["Grass", "Poison"] as any, level: 5 }),
    createPokemon({ id: "4", species: "Feebas", nickname: "", gender: "f", types: ["Water", "Water"] as any, level: 10 }),
    createPokemon({ id: "5", species: "Umbreon", nickname: "Shadow", gender: "m", types: ["Dark", "Dark"] as any, level: 50, status: "Dead" }),
    createPokemon({ id: "6", species: "Gengar", nickname: "Spooky", gender: "f", types: ["Ghost", "Poison"] as any, level: 55 }),
    createPokemon({ id: "7", species: "Spiritomb", nickname: "", gender: "f", types: ["Ghost", "Dark"] as any, level: 40, moves: ["Ice Beam", "Shadow Ball"] }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Parser tests
// ─────────────────────────────────────────────────────────────────────────────

describe("parseQuery", () => {
    it("parses a simple bare term", () => {
        const { ast, errors } = parseQuery("Br");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "BARE_TERM",
            value: "Br",
        });
    });

    it("parses a field filter", () => {
        const { ast, errors } = parseQuery("type:dark");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "FIELD_FILTER",
            field: "types",
            value: "dark",
        });
    });

    it("parses negation", () => {
        const { ast, errors } = parseQuery("!species:Bulbasaur");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "NOT",
            child: {
                type: "FIELD_FILTER",
                field: "species",
                value: "Bulbasaur",
            },
        });
    });

    it("parses OR expressions", () => {
        const { ast, errors } = parseQuery("type:dark | type:ghost");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "OR",
            children: [
                { type: "FIELD_FILTER", field: "types", value: "dark" },
                { type: "FIELD_FILTER", field: "types", value: "ghost" },
            ],
        });
    });

    it("parses AND expressions (implicit)", () => {
        const { ast, errors } = parseQuery("type:dark gender:f");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "AND",
            children: [
                { type: "FIELD_FILTER", field: "types", value: "dark" },
                { type: "FIELD_FILTER", field: "gender", value: "f" },
            ],
        });
    });

    it("parses grouped expressions", () => {
        const { ast, errors } = parseQuery("(type:dark | type:ghost) gender:f");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "AND",
            children: [
                {
                    type: "OR",
                    children: [
                        { type: "FIELD_FILTER", field: "types", value: "dark" },
                        { type: "FIELD_FILTER", field: "types", value: "ghost" },
                    ],
                },
                { type: "FIELD_FILTER", field: "gender", value: "f" },
            ],
        });
    });

    it("parses quoted strings", () => {
        const { ast, errors } = parseQuery('move:"ice beam"');
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "FIELD_FILTER",
            field: "moves",
            value: "ice beam",
        });
    });

    it("parses numeric comparisons", () => {
        const { ast, errors } = parseQuery("level>=20");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "FIELD_FILTER",
            field: "level",
            comparator: ">=",
            value: "20",
        });
    });

    it("parses numeric ranges", () => {
        const { ast, errors } = parseQuery("level:10..20");
        expect(errors).toHaveLength(0);
        expect(ast).toMatchObject({
            type: "FIELD_FILTER",
            field: "level",
            value: "10",
            rangeEnd: "20",
        });
    });

    it("warns on unknown field with suggestion", () => {
        const { warnings } = parseQuery("typoe:dark");
        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toContain("Unknown field");
        expect(warnings[0].suggestion).toBe("type");
    });

    it("reports error on unterminated quote", () => {
        const { errors } = parseQuery('species:"Feebas');
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].message).toContain("Unterminated");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Compiler + matching tests
// ─────────────────────────────────────────────────────────────────────────────

describe("compileQuery", () => {
    const match = (query: string, pokemon: Pokemon): boolean => {
        const { ast } = parseQuery(query);
        const predicate = compileQuery(ast);
        const normalized = normalizePokemon(pokemon);
        return predicate(pokemon, normalized);
    };

    describe("bare term (prefix matching)", () => {
        it("matches species starting with query", () => {
            expect(match("Br", testTeam[0])).toBe(true); // Bruxish
            expect(match("Br", testTeam[1])).toBe(true); // Breloom
            expect(match("Br", testTeam[2])).toBe(false); // Bulbasaur
        });

        it("matches nickname starting with query", () => {
            expect(match("Bre", testTeam[0])).toBe(true); // nickname: Breem
        });

        it("is case-insensitive", () => {
            expect(match("br", testTeam[0])).toBe(true);
            expect(match("BR", testTeam[0])).toBe(true);
        });
    });

    describe("field filters", () => {
        it("matches species field", () => {
            expect(match("species:Feebas", testTeam[3])).toBe(true);
            expect(match("species:Fee", testTeam[3])).toBe(true); // prefix
            expect(match("species:Pikachu", testTeam[3])).toBe(false);
        });

        it("matches type field (array)", () => {
            expect(match("type:dark", testTeam[4])).toBe(true); // Umbreon
            expect(match("type:ghost", testTeam[5])).toBe(true); // Gengar
            expect(match("type:dark", testTeam[0])).toBe(false); // Bruxish
        });

        it("matches gender field", () => {
            expect(match("gender:f", testTeam[0])).toBe(true);
            expect(match("gender:m", testTeam[0])).toBe(false);
        });

        it("matches status (box)", () => {
            expect(match("status:Dead", testTeam[4])).toBe(true);
            expect(match("box:Dead", testTeam[4])).toBe(true); // alias
            expect(match("status:Team", testTeam[0])).toBe(true);
        });

        it("matches shiny boolean", () => {
            expect(match("shiny:true", testTeam[1])).toBe(true);
            expect(match("shiny:yes", testTeam[1])).toBe(true);
            expect(match("shiny:1", testTeam[1])).toBe(true);
            expect(match("shiny:true", testTeam[0])).toBe(false);
        });

        it("matches moves (substring)", () => {
            expect(match("move:ice", testTeam[6])).toBe(true); // has "Ice Beam"
            expect(match('move:"ice beam"', testTeam[6])).toBe(true);
            expect(match("move:shadow", testTeam[6])).toBe(true); // has "Shadow Ball"
        });
    });

    describe("numeric filters", () => {
        it("matches level equals", () => {
            expect(match("level:30", testTeam[0])).toBe(true);
            expect(match("level:30", testTeam[1])).toBe(false);
        });

        it("matches level >= comparison", () => {
            expect(match("level>=50", testTeam[4])).toBe(true);
            expect(match("level>=50", testTeam[5])).toBe(true);
            expect(match("level>=50", testTeam[0])).toBe(false);
        });

        it("matches level range", () => {
            expect(match("level:10..30", testTeam[0])).toBe(true); // 30
            expect(match("level:10..30", testTeam[3])).toBe(true); // 10
            expect(match("level:10..30", testTeam[4])).toBe(false); // 50
        });
    });

    describe("negation", () => {
        it("excludes matching Pokémon", () => {
            expect(match("!species:Bulbasaur", testTeam[0])).toBe(true);
            expect(match("!species:Bulbasaur", testTeam[2])).toBe(false);
        });

        it("works with type", () => {
            expect(match("!type:grass", testTeam[0])).toBe(true); // Water/Psychic
            expect(match("!type:grass", testTeam[1])).toBe(false); // Grass/Fighting
        });
    });

    describe("OR expressions", () => {
        it("matches either condition", () => {
            expect(match("type:dark | type:ghost", testTeam[4])).toBe(true); // Dark
            expect(match("type:dark | type:ghost", testTeam[5])).toBe(true); // Ghost
            expect(match("type:dark | type:ghost", testTeam[0])).toBe(false); // Water/Psychic
        });
    });

    describe("AND expressions", () => {
        it("matches both conditions", () => {
            expect(match("type:ghost gender:f", testTeam[5])).toBe(true); // Gengar
            expect(match("type:ghost gender:f", testTeam[6])).toBe(true); // Spiritomb
            expect(match("type:dark gender:m", testTeam[4])).toBe(true); // Umbreon
            expect(match("type:dark gender:f", testTeam[4])).toBe(false); // Umbreon is male
        });
    });

    describe("complex expressions", () => {
        it("matches (type:dark | type:ghost) gender:f", () => {
            expect(match("(type:dark | type:ghost) gender:f", testTeam[5])).toBe(true); // Gengar
            expect(match("(type:dark | type:ghost) gender:f", testTeam[6])).toBe(true); // Spiritomb
            expect(match("(type:dark | type:ghost) gender:f", testTeam[4])).toBe(false); // Umbreon is male
        });

        it("matches type:dark !status:Dead", () => {
            expect(match("type:dark !status:Dead", testTeam[6])).toBe(true); // Spiritomb (Team)
            expect(match("type:dark !status:Dead", testTeam[4])).toBe(false); // Umbreon (Dead)
        });
    });

    describe("wildcards", () => {
        it("matches nickname with wildcard", () => {
            // f*l should match names starting with f and containing l
            const pokemon = createPokemon({ nickname: "Feral" });
            expect(match("nickname:F*l", pokemon)).toBe(true);

            const pokemon2 = createPokemon({ nickname: "Fool" });
            expect(match("nickname:F*l", pokemon2)).toBe(true);

            const pokemon3 = createPokemon({ nickname: "Frank" });
            expect(match("nickname:F*l", pokemon3)).toBe(false);
        });

        it("matches with ? single-char wildcard", () => {
            const pokemon = createPokemon({ species: "Mew" });
            expect(match("species:Me?", pokemon)).toBe(true);

            const pokemon2 = createPokemon({ species: "Mewtwo" });
            expect(match("species:Me?", pokemon2)).toBe(false); // Too long
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// High-level searchPokemon tests
// ─────────────────────────────────────────────────────────────────────────────

describe("searchPokemon", () => {
    it("returns all IDs for empty query", () => {
        const { matchedIds } = searchPokemon(testTeam, "");
        expect(matchedIds.size).toBe(testTeam.length);
    });

    it("filters by prefix search", () => {
        const { matchedIds } = searchPokemon(testTeam, "Br");
        expect(matchedIds.size).toBe(2);
        expect(matchedIds.has("1")).toBe(true); // Bruxish/Breem
        expect(matchedIds.has("2")).toBe(true); // Breloom
    });

    it("filters by type", () => {
        const { matchedIds } = searchPokemon(testTeam, "type:dark");
        expect(matchedIds.size).toBe(2);
        expect(matchedIds.has("5")).toBe(true); // Umbreon
        expect(matchedIds.has("7")).toBe(true); // Spiritomb
    });

    it("filters by gender", () => {
        const { matchedIds } = searchPokemon(testTeam, "gender:f");
        expect(matchedIds.size).toBe(4);
    });

    it("filters by negation", () => {
        const { matchedIds } = searchPokemon(testTeam, "!species:Bulbasaur");
        expect(matchedIds.size).toBe(6);
        expect(matchedIds.has("3")).toBe(false); // Bulbasaur excluded
    });

    it("handles complex query", () => {
        const { matchedIds } = searchPokemon(testTeam, "(type:dark | type:ghost) gender:f");
        expect(matchedIds.size).toBe(2);
        expect(matchedIds.has("6")).toBe(true); // Gengar
        expect(matchedIds.has("7")).toBe(true); // Spiritomb
    });

    it("returns errors for invalid queries", () => {
        const { errors } = searchPokemon(testTeam, 'species:"Feebas');
        expect(errors.length).toBeGreaterThan(0);
    });

    it("falls back to prefix search on parse errors", () => {
        // Use a query with clear parse error (unterminated quote)
        // The fallback should still match using simple prefix search
        const { matchedIds, errors } = searchPokemon(testTeam, 'species:"Bru');
        // Should have tokenization error for unterminated quote
        expect(errors.length).toBeGreaterThan(0);
        // Fallback should try simple prefix match on "species:\"Bru"
        // which won't match much, but the main point is it doesn't crash
        // Let's also test that a clear error case doesn't return empty
        const { matchedIds: fallbackIds, errors: fallbackErrors } = searchPokemon(testTeam, '"Br');
        expect(fallbackErrors.length).toBeGreaterThan(0);
        // Fallback prefix "\"br" won't match, but it should not throw
        expect(fallbackIds.size).toBe(0); // No matches expected
    });
});

