import { describe, it, expect } from "vitest";
import { parseGen3Save } from "../gen3";
import { readFileSync } from "fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Gen 3 money parsing", () => {
    it("decrypts Emerald money from the Team/Items section with the security key", async () => {
        const saveData = Buffer.from(
            readFileSync(join(__dirname, "../emerald.sav")),
        );
        const result = await parseGen3Save(saveData, {
            boxMappings: [],
            selectedGame: "Emerald",
        });

        // Fixture has max money (999999) encrypted at section-1 0x490.
        expect(result.trainer.money).toBe("999999");
    });

    it("decrypts a second Emerald fixture correctly", async () => {
        const saveData = Buffer.from(
            readFileSync(join(__dirname, "../emerald2.sav")),
        );
        const result = await parseGen3Save(saveData, {
            boxMappings: [],
            selectedGame: "Emerald",
        });

        expect(result.trainer.money).toBe("991943");
    });

    it("reads unencrypted Ruby/Sapphire money from the Team/Items section", async () => {
        const saveData = Buffer.from(
            readFileSync(join(__dirname, "../ruby.sav")),
        );
        const result = await parseGen3Save(saveData, {
            boxMappings: [],
            selectedGame: "RS",
        });

        expect(result.trainer.money).toBe("37414");
    });

    it("decrypts FireRed/LeafGreen money at the FRLG offset with the security key", async () => {
        const saveData = Buffer.from(
            readFileSync(join(__dirname, "../firered.sav")),
        );
        const result = await parseGen3Save(saveData, {
            boxMappings: [],
            selectedGame: "FRLG",
        });

        // Fixture has 500000 encrypted at section-1 0x290.
        expect(result.trainer.money).toBe("500000");
    });

    it("does not treat trainer-info bytes at 0x490 as money", async () => {
        const saveData = Buffer.from(
            readFileSync(join(__dirname, "../emerald.sav")),
        );
        const result = await parseGen3Save(saveData, {
            boxMappings: [],
            selectedGame: "Emerald",
        });

        // Pre-fix bug returned 16711680 from section 0.
        expect(result.trainer.money).not.toBe("16711680");
        expect(Number(result.trainer.money)).toBeLessThanOrEqual(999999);
    });
});
