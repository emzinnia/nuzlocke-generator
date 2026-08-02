import { describe, it, expect, beforeAll } from "vitest";
import { parseGen1Save } from "../gen1";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const boxMappings = Array.from({ length: 12 }, (_, i) => ({
    name: `Box ${i + 1}`,
    status: "Boxed",
}));

describe("Gen 1 Save Parser", () => {
    describe("Red Save File", () => {
        let saveData: Buffer;

        beforeAll(() => {
            const savePath = join(__dirname, "../red.sav");
            saveData = Buffer.from(readFileSync(savePath));
        });

        it("should parse the save file without errors", async () => {
            const result = await parseGen1Save(saveData, {
                boxMappings,
                selectedGame: "Red",
            });

            expect(result).toBeDefined();
            expect(result.pokemon).toBeDefined();
            expect(result.pokemon.length).toBeGreaterThan(0);
        });

        it("should assign unique positions across boxed Pokemon", async () => {
            const result = await parseGen1Save(saveData, {
                boxMappings,
                selectedGame: "Red",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );
            const positions = boxedPokemon.map((p) => p.position);

            expect(boxedPokemon.length).toBeGreaterThan(20);
            expect(new Set(positions).size).toBe(positions.length);
            expect(boxedPokemon[0].position).toBe(1);
            // Second box starts at BOX_CAPACITY + 1.
            expect(boxedPokemon[20]?.position).toBe(21);
        });
    });
});
