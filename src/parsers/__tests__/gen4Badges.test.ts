import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import { Buffer } from "buffer";
import { parseGen4Save } from "../gen4";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readSave = (...parts: string[]) =>
    Buffer.from(readFileSync(join(__dirname, ...parts)));

describe("Gen 4 badge bitfield parsing", () => {
    it("maps DP badge bits to gym names instead of ordinal placeholders", async () => {
        const result = await parseGen4Save(readSave("../diamond.sav"), {
            boxMappings: [],
            selectedGame: "DP",
        });

        expect(result.trainer.badges?.map((badge) => badge.name)).toEqual([
            "Coal Badge",
            "Forest Badge",
            "Cobble Badge",
            "Fen Badge",
            "Relic Badge",
            "Mine Badge",
            "Icicle Badge",
            "Beacon Badge",
        ]);
    });

    it("keeps sparse DP badge bits on the matching gym (not the first N)", async () => {
        const save = Buffer.from(readSave("../diamond.sav"));
        // Update both DP general mirrors so block selection cannot keep the full set.
        save.writeUInt8(0x02, 0x7e);
        save.writeUInt8(0x02, 0x40000 + 0x7e);

        const result = await parseGen4Save(save, {
            boxMappings: [],
            selectedGame: "DP",
        });

        // Pre-fix countBits(0x02) + "Badge 1" ordinal mapping yielded Coal Badge.
        expect(result.trainer.badges?.map((badge) => badge.name)).toEqual([
            "Forest Badge",
        ]);
    });

    it("imports HGSS Kanto badges from 0x83 in addition to Johto at 0x7E", async () => {
        const result = await parseGen4Save(
            readSave("../fixtures/gen4/projectpokemon-base-soulsilver-boy.sav"),
            {
                boxMappings: [],
                selectedGame: "HGSS",
            },
        );

        expect(result.trainer.badges).toHaveLength(16);
        expect(result.trainer.badges?.map((badge) => badge.name)).toEqual([
            "Zephyr Badge",
            "Hive Badge",
            "Plain Badge",
            "Fog Badge",
            "Storm Badge",
            "Mineral Badge",
            "Glacier Badge",
            "Rising Badge",
            "Boulder Badge",
            "Cascade Badge",
            "Thunder Badge",
            "Rainbow Badge",
            "Soul Badge",
            "Marsh Badge",
            "Volcano Badge",
            "Earth Badge",
        ]);
    });

    it("does not treat the HGSS multiplayer avatar byte at 0x7F as Kanto badges", async () => {
        const save = Buffer.from(readSave("../heartgold.sav"));
        // Fixture has all Johto badges and avatar=Psychic (0x46) at 0x7F; Kanto at 0x83 is 0.
        expect(save.readUInt8(0x7f)).toBe(0x46);
        expect(save.readUInt8(0x83)).toBe(0x00);

        const result = await parseGen4Save(save, {
            boxMappings: [],
            selectedGame: "HGSS",
        });

        expect(result.trainer.badges).toHaveLength(8);
        expect(
            result.trainer.badges?.some((badge) =>
                badge.name.includes("Boulder"),
            ),
        ).toBe(false);
    });
});
