import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type WorkerSelf = {
    postMessage: (data: unknown) => void;
    onmessage?: (evt: { data: unknown }) => Promise<void> | void;
    onmessageerror?: (err: unknown) => void;
};

const loadSav = (name: string) =>
    readFileSync(join(process.cwd(), "src", "parsers", name));

type PostMessageMock = ReturnType<typeof vi.fn>;
type WorkerResult = {
    detectedGame?: { name: string };
    detectedSaveFormat?: string;
};

describe("parsers worker", () => {
    beforeEach(async () => {
        vi.resetModules();
        const mockSelf: WorkerSelf = {
            postMessage: vi.fn(),
            onmessage: undefined,
            onmessageerror: undefined,
        };
        (globalThis as unknown as { self: WorkerSelf }).self = mockSelf;
        await import("../worker");
    });

    it("detects Emerald from emerald.sav", async () => {
        const save = loadSav("emerald.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "emerald.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("Emerald");
        expect(call.detectedSaveFormat).toBe("Emerald");
    });

    it("detects Emerald from emerald2.sav", async () => {
        const save = loadSav("emerald2.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: {
                save,
                selectedGame: "Auto",
                boxMappings: [],
                fileName: "emerald2.sav",
            },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("Emerald");
        expect(call.detectedSaveFormat).toBe("Emerald");
    });

    it("detects FireRed from firered.sav", async () => {
        const save = loadSav("firered.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "firered.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("FireRed");
        expect(call.detectedSaveFormat).toBe("FRLG");
    });
});

