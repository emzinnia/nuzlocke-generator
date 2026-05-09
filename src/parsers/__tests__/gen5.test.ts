import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Buffer } from "buffer";
import { detectGen5Layout, parseGen5Save, type Gen5Game } from "../gen5";
import type { Game } from "utils";

const fixturePath = (...parts: string[]) =>
    join(process.cwd(), "src", "parsers", "fixtures", "gen5", ...parts);

const readFixture = (name: string) => readFileSync(fixturePath(name));
const readParserFile = (name: string) => readFileSync(join(process.cwd(), "src", "parsers", name));

const BLOCK_PERMUTATIONS = [
    "ABCD",
    "ABDC",
    "ACBD",
    "ACDB",
    "ADBC",
    "ADCB",
    "BACD",
    "BADC",
    "BCAD",
    "BCDA",
    "BDAC",
    "BDCA",
    "CABD",
    "CADB",
    "CBAD",
    "CBDA",
    "CDAB",
    "CDBA",
    "DABC",
    "DACB",
    "DBAC",
    "DBCA",
    "DCAB",
    "DCBA",
];

const cryptWords = (buffer: Buffer, seedValue: number) => {
    const out = Buffer.alloc(buffer.length);
    let seed = seedValue >>> 0;
    for (let i = 0; i < buffer.length; i += 2) {
        seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0;
        const key = (seed >>> 16) & 0xffff;
        out.writeUInt16LE((buffer.readUInt16LE(i) ^ key) & 0xffff, i);
    }
    return out;
};

const sumPk5Checksum = (buffer: Buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        sum = (sum + buffer.readUInt16LE(i)) & 0xffff;
    }
    return sum;
};

const encryptPk5 = (decryptedPk5: Buffer) => {
    const normalized = Buffer.from(decryptedPk5);
    const pid = normalized.readUInt32LE(0x00);
    const checksum = sumPk5Checksum(normalized.subarray(0x08, 0x88));
    normalized.writeUInt16LE(checksum, 0x06);

    const blocks: Record<string, Buffer> = {
        A: normalized.subarray(0x08, 0x28),
        B: normalized.subarray(0x28, 0x48),
        C: normalized.subarray(0x48, 0x68),
        D: normalized.subarray(0x68, 0x88),
    };
    const order = BLOCK_PERMUTATIONS[((pid & 0x3e000) >> 0x0d) % 24];
    const shuffled = Buffer.concat([...order].map((letter) => blocks[letter]));
    const encrypted = Buffer.alloc(normalized.length);

    normalized.copy(encrypted, 0, 0x00, 0x08);
    cryptWords(shuffled, checksum).copy(encrypted, 0x08);
    if (normalized.length > 0x88) {
        cryptWords(normalized.subarray(0x88), pid).copy(encrypted, 0x88);
    }

    return encrypted;
};

describe("Gen 5 Save Parser", () => {
    const baseSaves: Array<{
        fileName: string;
        layout: Gen5Game;
        game: Game;
        trainer: string;
        trainerId: string;
    }> = [
        {
            fileName: "projectpokemon-base-black-boy.sav",
            layout: "BW",
            game: "Black",
            trainer: "Black",
            trainerId: "41745",
        },
        {
            fileName: "projectpokemon-base-white-boy.sav",
            layout: "BW",
            game: "White",
            trainer: "White",
            trainerId: "09058",
        },
        {
            fileName: "projectpokemon-base-black-2-boy.sav",
            layout: "B2W2",
            game: "Black 2",
            trainer: "Black",
            trainerId: "06845",
        },
        {
            fileName: "projectpokemon-base-white-2-boy.sav",
            layout: "B2W2",
            game: "White 2",
            trainer: "White",
            trainerId: "45119",
        },
    ];

    it.each(baseSaves)("detects and parses $game raw saves", async (save) => {
        const saveData = readFixture(save.fileName);
        const result = await parseGen5Save(saveData, {
            boxMappings: [],
            debug: true,
        });

        expect(detectGen5Layout(saveData)).toBe(save.layout);
        expect(result.game).toBe(save.game);
        expect(result.trainer).toMatchObject({
            name: save.trainer,
            id: save.trainerId,
            money: "3000",
            badges: [],
        });
        expect(result.pokemon).toEqual([]);
        expect(result.debug).toMatchObject({
            layout: save.layout,
            game: save.game,
            footerChecksumValid: true,
            validBlockCount: 35,
            partyCount: 0,
        });
    });

    it("can select the backup save in a raw B2W2 container", async () => {
        const saveData = Buffer.from(readFixture("projectpokemon-base-black-2-boy.sav"));
        saveData.writeUInt16LE(saveData.readUInt16LE(0x25fa2) ^ 0xffff, 0x25fa2);

        const result = await parseGen5Save(saveData, {
            boxMappings: [],
            debug: true,
        });

        expect(detectGen5Layout(saveData)).toBe("B2W2");
        expect(result.game).toBe("Black 2");
        expect(result.debug).toMatchObject({
            layout: "B2W2",
            activeBase: "0x26000",
            footerChecksumValid: true,
        });
    });

    it("decrypts PK5 party data from a Gen 5 save", async () => {
        const saveData = Buffer.from(
            readFixture("projectpokemon-base-black-2-boy.sav").subarray(0, 0x26000),
        );
        const encryptedPk5 = encryptPk5(readFixture("pkhex-haxorus.pk5"));
        saveData.writeUInt8(1, 0x18e04);
        encryptedPk5.copy(saveData, 0x18e08);

        const result = await parseGen5Save(saveData, {
            boxMappings: [],
            selectedGame: "B2W2",
            debug: true,
        });

        expect(result.game).toBe("Black 2");
        expect(result.debug).toMatchObject({
            layout: "B2W2",
            footerChecksumValid: true,
            partyCount: 1,
        });
        expect(result.pokemon).toHaveLength(1);
        expect(result.pokemon[0]).toMatchObject({
            species: "Haxorus",
            nickname: "Haxorus",
            status: "Team",
            id: "5bb800f7",
            moves: ["Taunt", "Dragon Pulse", "Swords Dance", "Guillotine"],
            shiny: true,
            gender: "m",
            nature: "Naive",
            gameOfOrigin: "White 2",
            met: "Nature Preserve",
            metLevel: 60,
            level: 60,
            pokeball: "Master Ball",
            ability: "Rivalry",
            types: ["Dragon"],
        });
        expect(result.pokemon[0].extraData).toMatchObject({
            originGame: "White 2",
            originGameId: 22,
            originalTrainerName: "Lego",
            metLocation: 147,
            metLocationName: "Nature Preserve",
            checksumStored: 41388,
        });
    });

    it("derives legal boxed Pokemon levels from Black 2 PC data", async () => {
        const result = await parseGen5Save(readParserFile("black2.sav"), {
            boxMappings: [],
            debug: true,
        });
        const boxed = result.pokemon.filter((pokemon) => pokemon.status === "Boxed");
        const invalidLevels = result.pokemon.filter(
            (pokemon) =>
                typeof pokemon.level !== "number" ||
                pokemon.level < 1 ||
                pokemon.level > 100,
        );

        expect(result.game).toBe("Black 2");
        expect(result.trainer.badges?.map(({ name }) => name)).toEqual([
            "Basic Badge",
            "Toxic Badge",
            "Insect Badge",
            "Bolt Badge",
            "Quake Badge",
            "Jet Badge",
            "Legend Badge",
            "Wave Badge",
        ]);
        expect(result.pokemon).toHaveLength(712);
        expect(boxed).toHaveLength(706);
        expect(invalidLevels).toEqual([]);
        expect(boxed.slice(0, 5).map((pokemon) => ({
            species: pokemon.species,
            level: pokemon.level,
            gameOfOrigin: pokemon.gameOfOrigin,
            met: pokemon.met,
        }))).toEqual([
            { species: "Bulbasaur", level: 5, gameOfOrigin: "HeartGold", met: "Johto" },
            { species: "Ivysaur", level: 16, gameOfOrigin: "HeartGold", met: "Johto" },
            { species: "Venusaur", level: 32, gameOfOrigin: "HeartGold", met: "Johto" },
            { species: "Charmander", level: 5, gameOfOrigin: "HeartGold", met: "Johto" },
            { species: "Charmeleon", level: 16, gameOfOrigin: "HeartGold", met: "Johto" },
        ]);
        expect(result.pokemon.slice(0, 3).map((pokemon) => pokemon.met)).toEqual([
            "Aspertia City",
            "Aspertia City",
            "Aspertia City",
        ]);
    });
});
