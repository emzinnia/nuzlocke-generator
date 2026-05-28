import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";
import { parseGen1Save } from "../gen1";
import { parseGen2Save } from "../gen2";
import { BoxMappings } from "../utils/boxMappings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GEN1_BOX_OFFSETS = [
    0x4000, 0x4462, 0x48c4, 0x4d26, 0x5188, 0x55ea, 0x6000, 0x6462, 0x68c4,
    0x6d26, 0x7188, 0x75ea,
];
const GEN2_BOX_OFFSETS = [
    0x4000, 0x4450, 0x48a0, 0x4cf0, 0x5140, 0x5590, 0x59e0, 0x6000, 0x6450,
    0x68a0, 0x6cf0, 0x7140, 0x7590, 0x79e0,
];

const loadSav = (name: string) =>
    Buffer.from(readFileSync(join(__dirname, "..", name)));

const makeBoxMappings = (count: number): BoxMappings =>
    Array.from({ length: count }, (_, index) => ({
        key: index + 1,
        status: "Boxed",
        name: `Box ${index + 1}`,
    }));

const sumBoxCounts = (save: Buffer, offsets: number[]) =>
    offsets.reduce((total, offset) => total + save[offset], 0);

describe("Gen 1 and Gen 2 boxed Pokemon counts", () => {
    it("parses only occupied Gen 1 boxed slots", async () => {
        const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
        const save = loadSav("red.sav");

        try {
            const result = await parseGen1Save(save, {
                boxMappings: makeBoxMappings(12),
            });
            const team = result.pokemon.filter((poke) => poke.status === "Team");
            const boxed = result.pokemon.filter(
                (poke) => poke.status === "Boxed",
            );

            expect(sumBoxCounts(save, GEN1_BOX_OFFSETS)).toBe(161);
            expect(team).toHaveLength(6);
            expect(boxed).toHaveLength(161);
            expect(result.pokemon).toHaveLength(167);
        } finally {
            consoleLog.mockRestore();
        }
    });

    it("parses only occupied Gen 2 boxed slots", async () => {
        const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
        const save = loadSav("gold.sav");

        try {
            const result = await parseGen2Save(save, {
                boxMappings: makeBoxMappings(14),
                isCrystal: false,
            });
            const team = result.pokemon.filter((poke) => poke.status === "Team");
            const boxed = result.pokemon.filter(
                (poke) => poke.status === "Boxed",
            );

            expect(sumBoxCounts(save, GEN2_BOX_OFFSETS)).toBe(169);
            expect(team).toHaveLength(6);
            expect(boxed).toHaveLength(169);
            expect(result.pokemon).toHaveLength(175);
        } finally {
            consoleLog.mockRestore();
        }
    });
});
