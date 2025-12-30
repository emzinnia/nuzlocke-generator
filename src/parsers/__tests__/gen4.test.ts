import { describe, it, expect, beforeAll } from "vitest";
import { parseGen4Save } from "../gen4";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            // @ts-expect-error play time should be surfaced by the parser
            expect(result.trainer.time).toBe("345:13:7");
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

    describe.skip("HeartGold Save File", () => {
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
});
