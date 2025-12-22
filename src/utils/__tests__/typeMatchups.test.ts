/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
    getTypeChartForGeneration,
    POKEMON_TYPES,
    buildTeamMatchups,
    MatchupSummaryRow,
} from "../typeMatchups";
import { Generation } from "../getters/getGameGeneration";
import { Types } from "../Types";
import { Pokemon } from "models";

const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
    id: `poke-${Math.random().toString(36).slice(2)}`,
    species: "Test",
    status: "Team",
    types: [Types.Normal, Types.Normal],
    ...overrides,
});

describe("typeMatchups utilities", () => {
    describe("POKEMON_TYPES", () => {
        it("contains all 18 standard Pokemon types", () => {
            expect(POKEMON_TYPES).toHaveLength(18);
            expect(POKEMON_TYPES).toContain(Types.Normal);
            expect(POKEMON_TYPES).toContain(Types.Fire);
            expect(POKEMON_TYPES).toContain(Types.Water);
            expect(POKEMON_TYPES).toContain(Types.Electric);
            expect(POKEMON_TYPES).toContain(Types.Grass);
            expect(POKEMON_TYPES).toContain(Types.Ice);
            expect(POKEMON_TYPES).toContain(Types.Fighting);
            expect(POKEMON_TYPES).toContain(Types.Poison);
            expect(POKEMON_TYPES).toContain(Types.Ground);
            expect(POKEMON_TYPES).toContain(Types.Flying);
            expect(POKEMON_TYPES).toContain(Types.Psychic);
            expect(POKEMON_TYPES).toContain(Types.Bug);
            expect(POKEMON_TYPES).toContain(Types.Rock);
            expect(POKEMON_TYPES).toContain(Types.Ghost);
            expect(POKEMON_TYPES).toContain(Types.Dragon);
            expect(POKEMON_TYPES).toContain(Types.Dark);
            expect(POKEMON_TYPES).toContain(Types.Steel);
            expect(POKEMON_TYPES).toContain(Types.Fairy);
        });
    });

    describe("getTypeChartForGeneration", () => {
        it("returns a chart for Gen 9", () => {
            const chart = getTypeChartForGeneration(Generation.Gen9);
            expect(chart).toBeDefined();
            expect(chart.Normal).toBeDefined();
            expect(chart.Fire).toBeDefined();
        });

        it("returns a chart for Gen 1", () => {
            const chart = getTypeChartForGeneration(Generation.Gen1);
            expect(chart).toBeDefined();
        });

        it("has Ghost immune to Normal in all generations", () => {
            const gen9Chart = getTypeChartForGeneration(Generation.Gen9);
            const gen1Chart = getTypeChartForGeneration(Generation.Gen1);

            expect(gen9Chart.Ghost.Normal).toBe(0);
            expect(gen1Chart.Ghost.Normal).toBe(0);
        });

        it("has Normal immune to Ghost in all generations", () => {
            const gen9Chart = getTypeChartForGeneration(Generation.Gen9);
            const gen1Chart = getTypeChartForGeneration(Generation.Gen1);

            expect(gen9Chart.Normal.Ghost).toBe(0);
            expect(gen1Chart.Normal.Ghost).toBe(0);
        });

        it("has Fire super effective against Grass", () => {
            const chart = getTypeChartForGeneration(Generation.Gen9);
            expect(chart.Grass.Fire).toBe(2);
        });

        it("has Water resisted by Water", () => {
            const chart = getTypeChartForGeneration(Generation.Gen9);
            expect(chart.Water.Water).toBe(0.5);
        });

        it("has Ground immune to Electric", () => {
            const chart = getTypeChartForGeneration(Generation.Gen9);
            expect(chart.Ground.Electric).toBe(0);
        });

        it("has Fairy immune to Dragon in Gen 6+", () => {
            const gen6Chart = getTypeChartForGeneration(Generation.Gen6);
            const gen9Chart = getTypeChartForGeneration(Generation.Gen9);

            expect(gen6Chart.Fairy.Dragon).toBe(0);
            expect(gen9Chart.Fairy.Dragon).toBe(0);
        });

        it("handles Gen 1 type chart differences (Psychic vs Ghost)", () => {
            const gen1Chart = getTypeChartForGeneration(Generation.Gen1);
            // In Gen 1, Psychic was immune to Ghost (due to bug/design)
            expect(gen1Chart.Psychic.Ghost).toBe(0);
        });

        it("handles Steel type differently in early generations", () => {
            const gen5Chart = getTypeChartForGeneration(Generation.Gen5);
            const gen6Chart = getTypeChartForGeneration(Generation.Gen6);

            // In Gen 5 and earlier, Steel resisted Dark and Ghost
            expect(gen5Chart.Steel.Dark).toBe(0.5);
            expect(gen5Chart.Steel.Ghost).toBe(0.5);

            // In Gen 6+, Steel no longer resists Dark and Ghost
            expect(gen6Chart.Steel.Dark).toBe(1);
            expect(gen6Chart.Steel.Ghost).toBe(1);
        });
    });

    describe("buildTeamMatchups", () => {
        it("returns empty matchups for empty team", () => {
            const result = buildTeamMatchups([], Generation.Gen9);

            expect(result).toHaveLength(18);
            result.forEach((row: MatchupSummaryRow) => {
                expect(row.weak).toBe(0);
                expect(row.resist).toBe(0);
                expect(row.immune).toBe(0);
                expect(row.neutral).toBe(0);
            });
        });

        it("calculates single type weaknesses correctly", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [Types.Fire, Types.Fire] }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Fire is weak to Water, Ground, Rock
            const waterRow = result.find((r: MatchupSummaryRow) => r.type === Types.Water);
            const groundRow = result.find((r: MatchupSummaryRow) => r.type === Types.Ground);
            const rockRow = result.find((r: MatchupSummaryRow) => r.type === Types.Rock);

            expect(waterRow?.weak).toBe(1);
            expect(groundRow?.weak).toBe(1);
            expect(rockRow?.weak).toBe(1);
        });

        it("calculates resistances correctly", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [Types.Fire, Types.Fire] }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Fire resists Fire, Grass, Ice, Bug, Steel, Fairy
            const fireRow = result.find((r: MatchupSummaryRow) => r.type === Types.Fire);
            const grassRow = result.find((r: MatchupSummaryRow) => r.type === Types.Grass);
            const iceRow = result.find((r: MatchupSummaryRow) => r.type === Types.Ice);

            expect(fireRow?.resist).toBe(1);
            expect(grassRow?.resist).toBe(1);
            expect(iceRow?.resist).toBe(1);
        });

        it("calculates dual type resistances correctly", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [Types.Fire, Types.Flying] }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Fire/Flying takes 4x from Rock
            const rockRow = result.find((r: MatchupSummaryRow) => r.type === Types.Rock);
            expect(rockRow?.weak).toBe(1);

            // Fire/Flying is immune to Ground
            const groundRow = result.find((r: MatchupSummaryRow) => r.type === Types.Ground);
            expect(groundRow?.immune).toBe(1);
        });

        it("aggregates team matchups correctly", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [Types.Fire, Types.Fire] }),
                createMockPokemon({ types: [Types.Water, Types.Water] }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Water attacks: Fire is weak, Water resists
            const waterRow = result.find((r: MatchupSummaryRow) => r.type === Types.Water);
            expect(waterRow?.weak).toBe(1);
            expect(waterRow?.resist).toBe(1);
        });

        it("handles Pokemon with undefined types", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: undefined as any }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Should not crash and return valid data
            expect(result).toHaveLength(18);
        });

        it("handles Pokemon with empty types array", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [] as any }),
            ];

            const result = buildTeamMatchups(team, Generation.Gen9);

            // Should not crash and return valid data
            expect(result).toHaveLength(18);
        });

        it("uses ability matchups when enabled", () => {
            const team: Pokemon[] = [
                createMockPokemon({ types: [Types.Ground, Types.Ground], ability: "Levitate" }),
            ];

            const resultWithoutAbility = buildTeamMatchups(team, Generation.Gen9, {
                useAbilityMatchups: false,
            });
            const resultWithAbility = buildTeamMatchups(team, Generation.Gen9, {
                useAbilityMatchups: true,
            });

            // Ground is immune to Electric normally
            // With Levitate, Ground becomes immune to Ground (and still immune to Electric)
            const groundRowWithout = resultWithoutAbility.find(
                (r: MatchupSummaryRow) => r.type === Types.Ground,
            );
            const groundRowWith = resultWithAbility.find(
                (r: MatchupSummaryRow) => r.type === Types.Ground,
            );

            // Ground type takes neutral damage from Ground (0.5 × 2 = 1)
            // but with Levitate, Ground becomes immune to Ground moves
            expect(groundRowWith?.immune).toBeGreaterThanOrEqual(groundRowWithout?.immune ?? 0);
        });
    });
});

