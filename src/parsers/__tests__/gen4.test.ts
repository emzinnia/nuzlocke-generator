import { describe, it, expect, beforeAll } from "vitest";
import { parseGen4Save } from "../gen4";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const crc16Ccitt = (buffer: Buffer) => {
    let crc = 0xffff;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i] << 8;
        for (let b = 0; b < 8; b++) {
            const carry = crc & 0x8000;
            crc = (crc << 1) & 0xffff;
            if (carry) crc ^= 0x1021;
        }
    }
    return crc & 0xffff;
};

const writeGen4AsciiString = (
    buffer: Buffer,
    offset: number,
    value: string,
    maxChars: number,
) => {
    for (let i = 0; i < maxChars; i++) {
        const char = value[i];
        let code = 0xffff;
        if (char) {
            if (char >= "A" && char <= "Z") {
                code = 0x012b + char.charCodeAt(0) - "A".charCodeAt(0);
            } else if (char >= "a" && char <= "z") {
                code = 0x0145 + char.charCodeAt(0) - "a".charCodeAt(0);
            } else if (char >= "0" && char <= "9") {
                code = 0x0121 + char.charCodeAt(0) - "0".charCodeAt(0);
            }
        }
        buffer.writeUInt16LE(code, offset + i * 2);
    }
};

const writeGen4CodeString = (
    buffer: Buffer,
    offset: number,
    codes: number[],
    maxChars: number,
) => {
    for (let i = 0; i < maxChars; i++) {
        buffer.writeUInt16LE(codes[i] ?? 0xffff, offset + i * 2);
    }
};

const setFooterCounters = (
    buffer: Buffer,
    blockStart: number,
    blockSize: number,
    major: number,
    minor: number,
) => {
    const footerStart = blockStart + blockSize - 0x14;
    buffer.writeUInt32LE(major, footerStart);
    buffer.writeUInt32LE(minor, footerStart + 0x04);
};

const refreshBlockChecksum = (
    buffer: Buffer,
    blockStart: number,
    blockSize: number,
    checksumFooterSize: number,
) => {
    const checksum = crc16Ccitt(
        buffer.subarray(blockStart, blockStart + blockSize - checksumFooterSize),
    );
    buffer.writeUInt16LE(checksum, blockStart + blockSize - 0x02);
};

describe("Gen 4 Save Parser", () => {
    describe("Diamond Save File", () => {
        let saveData: Buffer;

        beforeAll(() => {
            const savePath = join(__dirname, "../diamond.sav");
            saveData = Buffer.from(readFileSync(savePath));
        });

        it("should parse the save file without errors", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            expect(result).toBeDefined();
            expect(result.trainer).toBeDefined();
            expect(result.pokemon).toBeDefined();
        });

        it("should parse trainer info correctly", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            expect(result.trainer.name).toBe("Roy");
            expect(result.trainer.id).toBe("01081");
            expect(result.trainer.money).toBe("120881");
            expect(result.trainer.time).toBe("345:13:7");
        });

        it("selects the active general block using PKHeX footer counter order", async () => {
            const modified = Buffer.from(saveData);
            const generalSize = 0x0c100;
            const primary = 0x00000;
            const backup = 0x40000;

            writeGen4AsciiString(modified, backup + 0x64, "BACKUP", 8);

            setFooterCounters(modified, primary, generalSize, 1, 100);
            setFooterCounters(modified, backup, generalSize, 2, 1);
            refreshBlockChecksum(modified, primary, generalSize, 0x14);
            refreshBlockChecksum(modified, backup, generalSize, 0x14);

            const result = await parseGen4Save(modified, {
                boxMappings: [],
                selectedGame: "DP",
            });

            expect(result.trainer.name).toBe("Backup");
        });

        it("decodes international and Korean Gen 4 trainer text", async () => {
            const modified = Buffer.from(saveData);
            const generalSize = 0x0c100;

            writeGen4CodeString(
                modified,
                0x64,
                [0x0003, 0x0188, 0x01bb, 0x0401],
                8,
            );
            refreshBlockChecksum(modified, 0x00000, generalSize, 0x14);

            const result = await parseGen4Save(modified, {
                boxMappings: [],
                selectedGame: "DP",
            });

            expect(result.trainer.name).toBe("あé♂가");
        });

        it("should report all badges as earned", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            expect(result.trainer.badges).toBeDefined();
            expect(result.trainer.badges.length).toBe(8);
        });

        it("should parse the party Pokemon correctly", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon.length).toBe(6);

            expect(partyPokemon[0].species).toBe("Gengar");
            expect(partyPokemon[1].species).toBe("Lapras");
            expect(partyPokemon[2].species).toBe("Dragonite");
            expect(partyPokemon[3].species).toBe("Rayquaza");
            expect(partyPokemon[4].species).toBe("Bibarel");
            expect(partyPokemon[5].species).toBe("Darkrai");
            expect(partyPokemon.map((pokemon) => pokemon.egg)).toEqual([
                false,
                false,
                false,
                false,
                false,
                false,
            ]);
        });

        it("should have correct positions for party Pokemon", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon[0].position).toBe(1);
            expect(partyPokemon[1].position).toBe(2);
            expect(partyPokemon[2].position).toBe(3);
            expect(partyPokemon[3].position).toBe(4);
            expect(partyPokemon[4].position).toBe(5);
            expect(partyPokemon[5].position).toBe(6);
        });

        it("should use species names when Pokemon do not have custom nicknames", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon[3].species).toBe("Rayquaza");
            expect(partyPokemon[3].nickname).toBe("Rayquaza");
        });

        it("should parse Gen 4 Pokemon metadata from PK4 fields", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );
            const unown = result.pokemon.find(
                (pokemon) =>
                    pokemon.status === "Boxed" && pokemon.species === "Unown",
            );

            expect(partyPokemon[0]).toMatchObject({
                species: "Gengar",
                ability: "Levitate",
                nature: "Timid",
                gender: "f",
                met: "Pal Park",
                metLevel: 68,
            });
            expect(partyPokemon[3]).toMatchObject({
                species: "Rayquaza",
                ability: "Air Lock",
                nature: "Serious",
                gender: "genderless",
                met: "Pal Park",
                metLevel: 73,
            });
            expect(partyPokemon[5]).toMatchObject({
                species: "Darkrai",
                ability: "Bad Dreams",
                nature: "Naughty",
                gender: "genderless",
                met: "Newmoon Island",
                metLevel: 40,
            });
            expect(unown).toMatchObject({
                species: "Unown",
                forme: "r",
                gender: "genderless",
                nature: "Jolly",
                ability: "Levitate",
                met: "Solaceon Ruins",
                metLevel: 17,
            });
            expect(unown?.extraData).toMatchObject({
                abilityId: 26,
                formId: 17,
                genderValue: 2,
                metLocation: 53,
            });
        });

        it("should only mark real PC eggs as eggs", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            expect(boxedPokemon.length).toBe(462);
            expect(boxedPokemon.filter((pokemon) => pokemon.egg)).toHaveLength(
                4,
            );
        });

        it("should parse boxed Pokemon from the active storage block", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            expect(
                boxedPokemon.slice(0, 8).map((pokemon) => ({
                    species: pokemon.species,
                    nickname: pokemon.nickname,
                    position: pokemon.position,
                })),
            ).toEqual([
                { species: "Geodude", nickname: "ROCK", position: 1 },
                { species: "Graveler", nickname: "ROCKY", position: 2 },
                { species: "Crobat", nickname: "EYELESS", position: 3 },
                { species: "Machop", nickname: "JON", position: 4 },
                { species: "Magikarp", nickname: "FOOL", position: 5 },
                { species: "Psyduck", nickname: "DUCKY", position: 6 },
                { species: "Budew", nickname: "BUD", position: 7 },
                { species: "Kricketune", nickname: "CRIC", position: 8 },
            ]);

            const positions = boxedPokemon.map((pokemon) => pokemon.position);
            expect(new Set(positions).size).toBe(positions.length);
        });

        it("should mark party Pokemon with correct status", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            partyPokemon.forEach((pokemon) => {
                expect(pokemon.status).toBe("Team");
            });
        });

        it("should parse Pokemon with valid IDs", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "DP",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            partyPokemon.forEach((pokemon) => {
                expect(pokemon.id).toBeDefined();
                expect(pokemon.id).not.toBe("");
            });
        });
    });

    describe("HeartGold Save File", () => {
        let saveData: Buffer;

        beforeAll(() => {
            const savePath = join(__dirname, "../heartgold.sav");
            saveData = Buffer.from(readFileSync(savePath));
        });

        it("should parse the save file without errors", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            expect(result).toBeDefined();
            expect(result.trainer).toBeDefined();
            expect(result.pokemon).toBeDefined();
        });

        it("should parse trainer info correctly", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            expect(result.trainer.name).toBe("Ethan");
            expect(result.trainer.id).toBe("49535");
            expect(result.trainer.money).toBe("235615");
            expect(result.trainer.time).toBe("14:42:32");
        });

        it("should validate HGSS block checksums with the 16-byte checksum footer", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
                debug: true,
            });

            expect(result.debug?.generalChecksumValid).toBe(true);
            expect(result.debug?.storageChecksumValid).toBe(true);
        });

        it("should parse the party Pokemon correctly", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon.length).toBe(6);

            expect(partyPokemon[0].species).toBe("Typhlosion");
            expect(partyPokemon[1].species).toBe("Dragonite");
            expect(partyPokemon[2].species).toBe("Gyarados");
            expect(partyPokemon[3].species).toBe("Scizor");
            expect(partyPokemon[4].species).toBe("Lucario");
            expect(partyPokemon[5].species).toBe("Sceptile");
            expect(partyPokemon.map((pokemon) => pokemon.egg)).toEqual([
                false,
                false,
                false,
                false,
                false,
                false,
            ]);
        });

        it("should map Exp Share to the image-compatible item name", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const gyarados = result.pokemon.find(
                (pokemon) => pokemon.species === "Gyarados",
            );

            expect(gyarados?.item).toBe("Exp Share");
        });

        it("should have correct positions for party Pokemon", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon[0].position).toBe(1);
            expect(partyPokemon[1].position).toBe(2);
            expect(partyPokemon[2].position).toBe(3);
            expect(partyPokemon[3].position).toBe(4);
            expect(partyPokemon[4].position).toBe(5);
            expect(partyPokemon[5].position).toBe(6);
        });

        it("should use species names for boxed Pokemon without custom nicknames", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            expect(boxedPokemon[0].species).toBe("Moltres");
            expect(boxedPokemon[0].nickname).toBe("Moltres");
        });

        it("should parse HGSS Pokemon metadata from PK4 fields", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon[0]).toMatchObject({
                species: "Typhlosion",
                ability: "Blaze",
                nature: "Lonely",
                gender: "m",
                met: "Twinleaf Town",
                metLevel: 5,
            });
            expect(partyPokemon[2]).toMatchObject({
                species: "Gyarados",
                ability: "Intimidate",
                nature: "Naughty",
                gender: "f",
                met: "Lake of Rage",
                metLevel: 30,
            });
            expect(partyPokemon[4]).toMatchObject({
                species: "Lucario",
                ability: "Inner Focus",
                nature: "Rash",
                gender: "m",
                met: "Wi-Fi Gift",
                metLevel: 16,
            });
        });

        it("should not mark boxed Pokemon as eggs", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            expect(boxedPokemon.length).toBe(41);
            expect(boxedPokemon.filter((pokemon) => pokemon.egg)).toHaveLength(
                0,
            );
        });

        it("should mark party Pokemon with correct status", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            partyPokemon.forEach((pokemon) => {
                expect(pokemon.status).toBe("Team");
            });
        });

        it("should parse Pokemon with valid IDs", async () => {
            const result = await parseGen4Save(saveData, {
                boxMappings: [],
                selectedGame: "HGSS",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            partyPokemon.forEach((pokemon) => {
                expect(pokemon.id).toBeDefined();
                expect(pokemon.id).not.toBe("");
            });
        });
    });

    describe("Downloaded Gen 4 fixture saves", () => {
        type FixtureCase = {
            fileName: string;
            selectedGame: "DP" | "Platinum" | "HGSS";
            trainer: {
                name: string;
                id: string;
                money: string;
                time: string;
            };
            party: string[];
            boxedCount: number;
            firstBoxed?: string[];
        };

        const fixtureCases: FixtureCase[] = [
            {
                fileName: "projectpokemon-base-diamond-boy.sav",
                selectedGame: "DP" as const,
                trainer: {
                    name: "Diamond",
                    id: "53883",
                    money: "3000",
                    time: "0:1:56",
                },
                party: [],
                boxedCount: 0,
            },
            {
                fileName: "projectpokemon-base-pearl-boy.sav",
                selectedGame: "DP" as const,
                trainer: {
                    name: "Pearl",
                    id: "27622",
                    money: "3000",
                    time: "0:1:55",
                },
                party: [],
                boxedCount: 0,
            },
            {
                fileName: "projectpokemon-base-platinum-boy.sav",
                selectedGame: "Platinum" as const,
                trainer: {
                    name: "Platinu",
                    id: "23775",
                    money: "3000",
                    time: "0:3:41",
                },
                party: [],
                boxedCount: 0,
            },
            {
                fileName: "projectpokemon-base-heartgold-boy.sav",
                selectedGame: "HGSS" as const,
                trainer: {
                    name: "Gold",
                    id: "20209",
                    money: "3000",
                    time: "0:1:49",
                },
                party: [],
                boxedCount: 0,
            },
            {
                fileName: "projectpokemon-base-soulsilver-boy.sav",
                selectedGame: "HGSS" as const,
                trainer: {
                    name: "Silver",
                    id: "27578",
                    money: "3000",
                    time: "0:1:37",
                },
                party: [],
                boxedCount: 0,
            },
            {
                fileName: "digiex-diamond-electabuzz.sav",
                selectedGame: "DP" as const,
                trainer: {
                    name: "Roy",
                    id: "01081",
                    money: "120881",
                    time: "345:13:7",
                },
                party: [
                    "Gengar",
                    "Dragonite",
                    "Rayquaza",
                    "Bibarel",
                    "Fearow",
                    "Fearow",
                ],
                boxedCount: 521,
                firstBoxed: [
                    "Ivysaur",
                    "LEAFER",
                    "COSMO",
                    "Squirtle",
                    "SJ",
                    "KORVO",
                ],
            },
        ];

        for (const fixture of fixtureCases) {
            it(`parses ${fixture.fileName}`, async () => {
                const savePath = join(
                    __dirname,
                    "../fixtures/gen4",
                    fixture.fileName,
                );
                const saveData = Buffer.from(readFileSync(savePath));
                const result = await parseGen4Save(saveData, {
                    boxMappings: [],
                    selectedGame: fixture.selectedGame,
                });

                expect(result.trainer).toMatchObject(fixture.trainer);

                const partyPokemon = result.pokemon.filter(
                    (p) => p.status === "Team",
                );
                const boxedPokemon = result.pokemon.filter(
                    (p) => p.status === "Boxed",
                );

                expect(partyPokemon.map((pokemon) => pokemon.species)).toEqual(
                    fixture.party,
                );
                expect(boxedPokemon.length).toBe(fixture.boxedCount);

                if (fixture.firstBoxed) {
                    expect(
                        boxedPokemon
                            .slice(0, fixture.firstBoxed.length)
                            .map((pokemon) => pokemon.nickname),
                    ).toEqual(fixture.firstBoxed);
                }
            });
        }
    });
});
