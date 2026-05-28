import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";
import { generateDefaultBoxMappings } from "reducers/saveUploadSettings";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type BufferGlobal = typeof globalThis & { Buffer?: typeof Buffer };

const globalWithBuffer = globalThis as BufferGlobal;
const originalGlobalBuffer = globalWithBuffer.Buffer;

afterEach(() => {
    globalWithBuffer.Buffer = originalGlobalBuffer;
});

describe("save parsers without a global Buffer", () => {
    it.each([
        ["Red", "red.sav"],
        ["Blue", "blue.sav"],
    ])("parses Gen 1 %s browser uploads without reading global Buffer", async (_game, fixture) => {
        const savePath = join(__dirname, `../${fixture}`);
        const saveData = Buffer.from(readFileSync(savePath));
        Reflect.deleteProperty(globalWithBuffer, "Buffer");
        vi.resetModules();

        const { parseGen1Save } = await import("../gen1");
        const result = await parseGen1Save(saveData, {
            boxMappings: generateDefaultBoxMappings("RBY"),
            selectedGame: "RBY",
        });

        expect(result.trainer).toBeDefined();
        expect(result.pokemon.length).toBeGreaterThan(0);
    });

    it("parses Gen 3 browser uploads without reading global Buffer", async () => {
        const savePath = join(__dirname, "../emerald.sav");
        const saveData = Buffer.from(readFileSync(savePath));
        Reflect.deleteProperty(globalWithBuffer, "Buffer");
        vi.resetModules();

        const { parseGen3Save } = await import("../gen3");
        const result = await parseGen3Save(saveData, {
            boxMappings: generateDefaultBoxMappings("Emerald"),
            selectedGame: "Emerald",
        });

        expect(result.trainer).toBeDefined();
        expect(result.pokemon.length).toBeGreaterThan(0);
    });

    it("parses Gen 2 browser uploads without reading global Buffer", async () => {
        const savePath = join(__dirname, "../crystal.sav");
        const saveData = Buffer.from(readFileSync(savePath));
        Reflect.deleteProperty(globalWithBuffer, "Buffer");
        vi.resetModules();

        const { parseGen2Save } = await import("../gen2");
        const result = await parseGen2Save(saveData, {
            boxMappings: generateDefaultBoxMappings("Crystal"),
            selectedGame: "Crystal",
            isCrystal: true,
        });

        expect(result.trainer).toBeDefined();
        expect(result.pokemon.length).toBeGreaterThan(0);
    });
});
