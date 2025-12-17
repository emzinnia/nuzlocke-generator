import { describe, it, expect, beforeAll } from "vitest";
import { parseGen3Save } from "../gen3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Gen 3 Save Parser", () => {
    describe("Emerald Save File", () => {
        let saveData: Buffer;

        beforeAll(() => {
            // Load the emerald.sav file
            const savePath = join(__dirname, "../emerald.sav");
            saveData = Buffer.from(readFileSync(savePath));
        });

        it("should parse the save file without errors", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            expect(result).toBeDefined();
            expect(result.trainer).toBeDefined();
            expect(result.pokemon).toBeDefined();
        });

        it("should parse the first three party Pokemon correctly as Salamence, Magcargo, and Smeargle", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            // Filter for party Pokemon (status: 'Team')

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            // Verify we have at least 3 Pokemon in the party
            expect(partyPokemon.length).toBeGreaterThanOrEqual(3);

            // Check the first three Pokemon species
            expect(partyPokemon[0].species).toBe("Salamence");
            expect(partyPokemon[1].species).toBe("Magcargo");
            expect(partyPokemon[2].species).toBe("Smeargle");
        });

        it("should parse the types of the first three party Pokemon correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            expect(partyPokemon[0].types).toEqual(["Dragon", "Flying"]);
            expect(partyPokemon[1].types).toEqual(["Fire", "Rock"]);
            expect(partyPokemon[2].types).toEqual(["Normal"]);
        });

        it("should parse the abilities of the first three party Pokemon correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );
            expect(partyPokemon[0].ability).toBe("Intimidate");
            expect(partyPokemon[1].ability).toBe("Flame Body");
            expect(partyPokemon[2].ability).toBe("Own Tempo");
        });

        it("should parse the locations of the first three party Pokemon correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );
            expect(partyPokemon[0].met).toBe("Meteor Falls");
            expect(partyPokemon[1].met).toBe("Route 113");
            expect(partyPokemon[2].met).toBe("Artisan Cave");
        });

        it("should have correct positions for party Pokemon", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            // Verify positions are sequential starting from 1
            expect(partyPokemon[0].position).toBe(1);
            expect(partyPokemon[1].position).toBe(2);
            expect(partyPokemon[2].position).toBe(3);
        });

        it("should mark party Pokemon with correct status", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            // All party Pokemon should have status 'Team'
            partyPokemon.forEach((pokemon) => {
                expect(pokemon.status).toBe("Team");
            });
        });

        it("should parse Pokemon with valid IDs", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            // Verify each Pokemon has a valid ID
            partyPokemon.forEach((pokemon) => {
                expect(pokemon.id).toBeDefined();
                expect(pokemon.id).not.toBe("");
            });
        });

        it("should parse the first team Pokemon moveset correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );

            // Get the first party Pokemon (Salamence)
            const firstPokemon = partyPokemon[0];

            // Verify the moveset
            expect(firstPokemon.moves).toBeDefined();
            expect(firstPokemon.moves).toEqual([
                "Headbutt",
                "Ember",
                "Dragon Breath",
                "Fly",
            ]);
        });

        it("should parse the first three boxed Pokemon correctly as Bulbasaur, Ivysaur, and Venusaur", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            // Filter for boxed Pokemon (status: 'Boxed')
            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            // Verify we have at least 3 Pokemon in boxes
            expect(boxedPokemon.length).toBeGreaterThanOrEqual(3);

            // Check the first three boxed Pokemon species
            expect(boxedPokemon[0].species).toBe("Bulbasaur");
            expect(boxedPokemon[1].species).toBe("Ivysaur");
            expect(boxedPokemon[2].species).toBe("Venusaur");
            expect(boxedPokemon[3].species).toBe("Charmander");
            expect(boxedPokemon[4].species).toBe("Charmeleon");
            expect(boxedPokemon[5].species).toBe("Charizard");
            expect(boxedPokemon[6].species).toBe("Squirtle");
            expect(boxedPokemon[7].species).toBe("Wartortle");
            expect(boxedPokemon[8].species).toBe("Blastoise");
            expect(boxedPokemon[9].species).toBe("Caterpie");
            expect(boxedPokemon[10].species).toBe("Metapod");
            expect(boxedPokemon[11].species).toBe("Butterfree");
        });

        it("should have unique ids for each boxed Pokemon", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );
            const uniqueIds = new Set(boxedPokemon.map((p) => p.id));
            expect(uniqueIds.size).toBe(boxedPokemon.length);
        });

        it("should parse the first boxed Pokemon moveset correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );

            // Get the first boxed Pokemon (Bulbasaur)
            const firstBoxedPokemon = boxedPokemon[0];

            // Verify the moveset
            expect(firstBoxedPokemon.moves).toBeDefined();
            expect(firstBoxedPokemon.moves).toEqual(["Tackle", "Growl"]);
        });

        it("should parse the first three dead Pokemon correctly as Nidoqueen, Nidoran♂, and Nidorino", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [
                    { key: 1, status: "Boxed" },
                    { key: 2, status: "Dead" },
                ],
                selectedGame: "Emerald",
            });

            // Filter for dead Pokemon (status: 'Dead')
            const deadPokemon = result.pokemon.filter(
                (p) => p.status === "Dead",
            );

            expect(deadPokemon.length).toBe(30);

            // Check the first thirty dead Pokemon species
            expect(deadPokemon[0].species).toBe("Nidoqueen");
            expect(deadPokemon[1].species).toBe("Nidoran♂");
            expect(deadPokemon[2].species).toBe("Nidorino");
            expect(deadPokemon[3].species).toBe("Nidoking");
            expect(deadPokemon[4].species).toBe("Clefairy");
            expect(deadPokemon[5].species).toBe("Clefable");
            expect(deadPokemon[6].species).toBe("Vulpix");
            expect(deadPokemon[7].species).toBe("Ninetales");
            expect(deadPokemon[8].species).toBe("Jigglypuff");
            expect(deadPokemon[9].species).toBe("Wigglytuff");
            expect(deadPokemon[10].species).toBe("Zubat");
            expect(deadPokemon[11].species).toBe("Golbat");
            expect(deadPokemon[12].species).toBe("Oddish");
            expect(deadPokemon[13].species).toBe("Gloom");
            expect(deadPokemon[14].species).toBe("Vileplume");
            expect(deadPokemon[15].species).toBe("Paras");
            expect(deadPokemon[16].species).toBe("Parasect");
            expect(deadPokemon[17].species).toBe("Venonat");
            expect(deadPokemon[18].species).toBe("Venomoth");
            expect(deadPokemon[19].species).toBe("Diglett");
            expect(deadPokemon[20].species).toBe("Dugtrio");
            expect(deadPokemon[21].species).toBe("Meowth");
            expect(deadPokemon[22].species).toBe("Persian");
            expect(deadPokemon[23].species).toBe("Psyduck");
            expect(deadPokemon[24].species).toBe("Golduck");
            expect(deadPokemon[25].species).toBe("Mankey");
            expect(deadPokemon[26].species).toBe("Primeape");
            expect(deadPokemon[27].species).toBe("Growlithe");
            expect(deadPokemon[28].species).toBe("Arcanine");
            expect(deadPokemon[29].species).toBe("Poliwag");

            // Check Nidoqueen's levels
            expect(deadPokemon[0].level).toBe(31);
            expect(deadPokemon[0].metLevel).toBe(31);
        });
    });

    describe("Emerald 2 Save File", () => {
        let saveData: Buffer;

        beforeAll(() => {
            // Load the emerald.sav file
            const savePath = join(__dirname, "../emerald2.sav");
            saveData = Buffer.from(readFileSync(savePath));
        });

        it("should parse the save file without errors", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            expect(result).toBeDefined();
            expect(result.trainer).toBeDefined();
            expect(result.pokemon).toBeDefined();
        });

        it("should parse Japanese nicknames correctly", async () => {
            // We know the save file contents of this and in this save file
            // Snorlax's nickname is カビゴン (which is actually just its regular
            //  Japanese name but in Gen 3 this gets treated as a nickname by the game engine)
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const snorlax = result.pokemon.find((p) => p.species === "Snorlax");
            expect(snorlax?.nickname).toBe("カビゴン");
        });

        it("should parse Item names correctly", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const pokemon = result.pokemon.find((p) => p.species === "Rayquaza");
            expect(pokemon?.item).toBe("Amulet Coin");
        });

        it("should parse the first five party Pokemon", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const partyPokemon = result.pokemon.filter(
                (p) => p.status === "Team",
            );
            expect(partyPokemon.length).toBe(5);
            expect(partyPokemon[0].species).toBe("Rayquaza");
            expect(partyPokemon[1].species).toBe("Aipom");
            expect(partyPokemon[2].species).toBe("Aipom");
            expect(partyPokemon[3].species).toBe("Aipom");
            expect(partyPokemon[4].species).toBe("Wailord");
        });

        it.skip("should parse the first set of boxed pokemon correct", async () => {
            const result = await parseGen3Save(saveData, {
                boxMappings: [],
                selectedGame: "Emerald",
            });

            const boxedPokemon = result.pokemon.filter(
                (p) => p.status === "Boxed",
            );
            expect(boxedPokemon[0].species).toBe("Spheal");
            expect(boxedPokemon[1].species).toBe("Magcargo");
            expect(boxedPokemon[2].species).toBe("Walrein");
            expect(boxedPokemon[3].species).toBe("Relicanth");
            expect(boxedPokemon[4].species).toBe("Groudon");
            expect(boxedPokemon[5].species).toBe("Jirachi");
        });
    });
});
