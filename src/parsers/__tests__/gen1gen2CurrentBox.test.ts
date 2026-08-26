import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";
import { parseGen1Save } from "../gen1";
import { parseGen2Save } from "../gen2";
import type { BoxMappings } from "../utils/boxMappings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gen1BoxMappings: BoxMappings = Array.from({ length: 12 }, (_, i) => ({
    key: i,
    status: "Boxed",
    name: `Box ${i + 1}`,
}));

const gen2BoxMappings: BoxMappings = Array.from({ length: 14 }, (_, i) => ({
    key: i,
    status: "Boxed",
    name: `Box ${i + 1}`,
}));

describe("Gen 1/2 current-box cache import", () => {
    it("imports Pokémon from Gen 1 Current Box cache when the banked box is stale (blue.sav)", async () => {
        const savePath = join(__dirname, "../blue.sav");
        const saveData = Buffer.from(readFileSync(savePath));

        // Fixture reality: current box 0 cache holds Charmander; banked box 0 is empty (0xFF).
        expect(saveData[0x284c] & 0x0f).toBe(0);
        expect(saveData[0x30c0]).toBe(1);
        expect(saveData[0x30c1]).toBe(0xb0); // Charmander
        expect(saveData[0x4000]).toBe(0xff);

        const result = await parseGen1Save(saveData, {
            boxMappings: gen1BoxMappings,
        });

        const boxedCharmander = result.pokemon.find(
            (p) => p.species === "Charmander" && p.status === "Boxed",
        );
        expect(boxedCharmander).toBeDefined();
    });

    it("prefers Gen 2 Current Box cache over a stale banked box copy", async () => {
        const savePath = join(__dirname, "../gold.sav");
        const saveData = Buffer.from(readFileSync(savePath));

        const currentBoxIndex = saveData[0x2724] & 0x0f;
        expect(currentBoxIndex).toBe(0);

        const baseline = await parseGen2Save(saveData, {
            boxMappings: gen2BoxMappings,
            isCrystal: false,
        });
        const baselineBoxed = baseline.pokemon.filter((p) => p.status === "Boxed");
        expect(baselineBoxed.length).toBeGreaterThan(0);
        const expectedSpecies = baselineBoxed[0]?.species;
        expect(expectedSpecies).toBeTruthy();

        // Simulate a stale bank: wipe banked box 0 count/species list while leaving the cache intact.
        const mutated = Buffer.from(saveData);
        mutated[0x4000] = 0;
        mutated.fill(0xff, 0x4001, 0x4001 + 21);

        const result = await parseGen2Save(mutated, {
            boxMappings: gen2BoxMappings,
            isCrystal: false,
        });

        const boxed = result.pokemon.filter((p) => p.status === "Boxed");
        expect(boxed.length).toBe(baselineBoxed.length);
        expect(boxed[0]?.species).toBe(expectedSpecies);
    });
});
