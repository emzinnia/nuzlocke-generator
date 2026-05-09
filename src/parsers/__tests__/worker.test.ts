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
    trainer?: { name?: string; money?: string };
    pokemon?: { species?: string; status?: string }[];
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

    it("detects Diamond from diamond.sav", async () => {
        const save = loadSav("diamond.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "diamond.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        const team = call.pokemon?.filter((p) => p.status === "Team") ?? [];
        expect(call.detectedGame?.name).toBe("Diamond");
        expect(call.detectedSaveFormat).toBe("DP");
        expect(team.map((p) => p.species)).toEqual([
            "Gengar",
            "Lapras",
            "Dragonite",
            "Rayquaza",
            "Bibarel",
            "Darkrai",
        ]);
    });

    it.each(["attempt.sav", "boss.sav", "DS save.sav"])(
        "ignores incidental Gen 4 abbreviation substrings in %s",
        async (fileName) => {
            const save = loadSav("diamond.sav");
            const selfRef = globalThis.self as unknown as WorkerSelf;
            await selfRef.onmessage?.({
                data: { save, selectedGame: "Auto", boxMappings: [], fileName },
            });
            const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
            expect(call.detectedGame?.name).toBe("Diamond");
            expect(call.detectedSaveFormat).toBe("DP");
        },
    );

    it("detects HeartGold from heartgold.sav", async () => {
        const save = loadSav("heartgold.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "heartgold.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        const team = call.pokemon?.filter((p) => p.status === "Team") ?? [];
        expect(call.detectedGame?.name).toBe("HeartGold");
        expect(call.detectedSaveFormat).toBe("HGSS");
        expect(team.map((p) => p.species)).toEqual([
            "Typhlosion",
            "Dragonite",
            "Gyarados",
            "Scizor",
            "Lucario",
            "Sceptile",
        ]);
    });

    it("labels Pearl filenames as Pearl while using the DP parser", async () => {
        const save = loadSav("diamond.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "pearl.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("Pearl");
        expect(call.detectedSaveFormat).toBe("DP");
    });

    it("detects Platinum from a Platinum save fixture", async () => {
        const save = loadSav("fixtures/gen4/projectpokemon-base-platinum-boy.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: {
                save,
                selectedGame: "Auto",
                boxMappings: [],
                fileName: "pokemon-platinum.sav",
            },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("Platinum");
        expect(call.detectedSaveFormat).toBe("Platinum");
        expect(call.trainer?.name).toBe("Platinu");
        expect(call.trainer?.money).toBe("3000");
    });

    it("labels SoulSilver filenames as SoulSilver while using the HGSS parser", async () => {
        const save = loadSav("heartgold.sav");
        const selfRef = globalThis.self as unknown as WorkerSelf;
        await selfRef.onmessage?.({
            data: { save, selectedGame: "Auto", boxMappings: [], fileName: "soulsilver.sav" },
        });
        const call = (selfRef.postMessage as PostMessageMock).mock.calls.at(-1)?.[0] as WorkerResult;
        expect(call.detectedGame?.name).toBe("SoulSilver");
        expect(call.detectedSaveFormat).toBe("HGSS");
    });
});
