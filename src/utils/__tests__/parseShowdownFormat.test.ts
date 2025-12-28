import { parseShowdownFormat, isValidShowdownFormat } from "../parseShowdownFormat";
import { Types } from "../Types";
import { listOfPokemon, Species } from "../data/listOfPokemon";
import { matchSpeciesToTypes } from "../formatters/matchSpeciesToTypes";

const showdownInput = `Jeff (Alomomola) @ Choice Scarf  
Ability: Regenerator  
Tera Type: Water  
EVs: 4 Atk / 252 SpA / 252 Spe  
Naive Nature  
- Aqua Jet  
- Flip Turn  
- Hydro Pump  
- Blizzard  

Harold (Ceruledge) @ Expert Belt  
Ability: Flash Fire  
Shiny: Yes  
Tera Type: Fire  
EVs: 252 HP / 4 Atk / 252 Spe  
Hasty Nature  
- Brick Break  
- Disable  
- Flamethrower  
- Curse  

Jeff 2 (Cinderace) @ Choice Specs  
Ability: Blaze  
Tera Type: Ice  
EVs: 252 Atk / 4 SpA / 252 Spe  
Hasty Nature  
- Flame Charge  
- Heat Wave  
- Baton Pass  
- Bulk Up  

Chien-Pao @ Heavy-Duty Boots  
Ability: Sword of Ruin  
Level: 91  
Tera Type: Ground  
EVs: 248 Atk / 8 SpD / 252 Spe  
Jolly Nature  
- Brick Break  
- Facade  
- Ice Spinner  
- Ice Fang  

Iron Boulder @ Assault Vest  
Ability: Quark Drive  
Tera Type: Rock  
EVs: 252 Atk / 4 SpD / 252 Spe  
Jolly Nature  
IVs: 0 HP  
- Brick Break  
- Double-Edge  
- Megahorn  
- Facade  

Azumarill  
Ability: Thick Fat  
Tera Type: Water  
- Blizzard  
- Chilling Water  
- Brick Break  `;

describe("parseShowdownFormat", () => {
    it("parses all 6 Pokemon from the input", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result).toHaveLength(6);
    });

    it("parses nicknames correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].nickname).toBe("Jeff");
        expect(result[0].species).toBe("Alomomola");
        expect(result[1].nickname).toBe("Harold");
        expect(result[1].species).toBe("Ceruledge");
        expect(result[2].nickname).toBe("Jeff 2");
        expect(result[2].species).toBe("Cinderace");
    });

    it("parses Pokemon without nicknames correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[3].species).toBe("Chien-Pao");
        expect(result[3].nickname).toBeUndefined();
        expect(result[4].species).toBe("Iron Boulder");
        expect(result[4].nickname).toBeUndefined();
        expect(result[5].species).toBe("Azumarill");
        expect(result[5].nickname).toBeUndefined();
    });

    it("parses held items correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].item).toBe("Choice Scarf");
        expect(result[1].item).toBe("Expert Belt");
        expect(result[2].item).toBe("Choice Specs");
        expect(result[3].item).toBe("Heavy-Duty Boots");
        expect(result[4].item).toBe("Assault Vest");
        expect(result[5].item).toBeUndefined();
    });

    it("parses abilities correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].ability).toBe("Regenerator");
        expect(result[1].ability).toBe("Flash Fire");
        expect(result[2].ability).toBe("Blaze");
        expect(result[3].ability).toBe("Sword of Ruin");
        expect(result[4].ability).toBe("Quark Drive");
        expect(result[5].ability).toBe("Thick Fat");
    });

    it("parses Tera Types correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].teraType).toBe(Types.Water);
        expect(result[1].teraType).toBe(Types.Fire);
        expect(result[2].teraType).toBe(Types.Ice);
        expect(result[3].teraType).toBe(Types.Ground);
        expect(result[4].teraType).toBe(Types.Rock);
        expect(result[5].teraType).toBe(Types.Water);
    });

    it("parses natures correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].nature).toBe("Naive");
        expect(result[1].nature).toBe("Hasty");
        expect(result[2].nature).toBe("Hasty");
        expect(result[3].nature).toBe("Jolly");
        expect(result[4].nature).toBe("Jolly");
        expect(result[5].nature).toBeUndefined();
    });

    it("parses shiny status correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].shiny).toBeUndefined();
        expect(result[1].shiny).toBe(true);
        expect(result[2].shiny).toBeUndefined();
    });

    it("parses level correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].level).toBeUndefined();
        expect(result[3].level).toBe(91);
    });

    it("parses moves correctly", () => {
        const result = parseShowdownFormat(showdownInput);
        expect(result[0].moves).toEqual(["Aqua Jet", "Flip Turn", "Hydro Pump", "Blizzard"]);
        expect(result[1].moves).toEqual(["Brick Break", "Disable", "Flamethrower", "Curse"]);
        expect(result[2].moves).toEqual(["Flame Charge", "Heat Wave", "Baton Pass", "Bulk Up"]);
        expect(result[3].moves).toEqual(["Brick Break", "Facade", "Ice Spinner", "Ice Fang"]);
        expect(result[4].moves).toEqual(["Brick Break", "Double-Edge", "Megahorn", "Facade"]);
        expect(result[5].moves).toEqual(["Blizzard", "Chilling Water", "Brick Break"]);
    });

    it("sets status to Team for all Pokemon", () => {
        const result = parseShowdownFormat(showdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.status).toBe("Team");
        });
    });

    it("generates unique IDs for each Pokemon", () => {
        const result = parseShowdownFormat(showdownInput);
        const ids = result.map((p) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(result.length);
    });

    it("assigns positions starting from startPosition", () => {
        const result = parseShowdownFormat(showdownInput, 10);
        expect(result[0].position).toBe(10);
        expect(result[1].position).toBe(11);
        expect(result[2].position).toBe(12);
        expect(result[3].position).toBe(13);
        expect(result[4].position).toBe(14);
        expect(result[5].position).toBe(15);
    });

    it("handles empty input", () => {
        const result = parseShowdownFormat("");
        expect(result).toEqual([]);
    });

    it("handles whitespace-only input", () => {
        const result = parseShowdownFormat("   \n\n   ");
        expect(result).toEqual([]);
    });

    it("parses a single Pokemon correctly", () => {
        const singlePokemon = `Pikachu @ Light Ball
Ability: Static
Tera Type: Electric
Timid Nature
- Thunderbolt
- Volt Tackle`;
        const result = parseShowdownFormat(singlePokemon);
        expect(result).toHaveLength(1);
        expect(result[0].species).toBe("Pikachu");
        expect(result[0].item).toBe("Light Ball");
        expect(result[0].ability).toBe("Static");
        expect(result[0].teraType).toBe(Types.Electric);
        expect(result[0].nature).toBe("Timid");
        expect(result[0].moves).toEqual(["Thunderbolt", "Volt Tackle"]);
    });

    it("handles Pokemon with gender suffix correctly", () => {
        const pokemonWithGender = `Nidoran (M) @ Life Orb
Ability: Poison Point
- Poison Jab`;
        const result = parseShowdownFormat(pokemonWithGender);
        expect(result).toHaveLength(1);
        expect(result[0].species).toBe("Nidoran");
        expect(result[0].nickname).toBeUndefined();
    });

    it("parses species names that exist in listOfPokemon", () => {
        const result = parseShowdownFormat(showdownInput);
        const expectedSpecies = ["Alomomola", "Ceruledge", "Cinderace", "Chien-Pao", "Iron Boulder", "Azumarill"];
        
        result.forEach((pokemon, index) => {
            expect(listOfPokemon).toContain(pokemon.species);
            expect(pokemon.species).toBe(expectedSpecies[index]);
        });
    });
});

const gen1ShowdownInput = `Alakazam  
Ability: No Ability  
- Body Slam  
- Reflect  
- Psychic  

Chance (Chansey) (F)  
Ability: No Ability  
- Counter  
- Hyper Beam  
- Rest  
- Sing  

Mike (Nidoran-M) (M)  
Ability: No Ability  
- Thunderbolt  
- Double Kick  
- Thunder  
- Rest  

Moo (Mew)  
Ability: No Ability  
- Fire Blast  
- Counter  
- Rock Slide  
- Reflect  

Nidoran-F (F)  
Ability: No Ability  
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 Spe  
Serious Nature  
- Rest  
- Thunder  
- Thunderbolt  
- Double Kick  

Zapdos  
Ability: No Ability  
EVs: 252 HP / 108 Atk / 12 Def / 252 SpA / 252 Spe  
Serious Nature  
IVs: 0 HP  
- Rest  
- Thunder  
- Thunderbolt  
- Drill Peck  `;

describe("parseShowdownFormat with Gen 1 style input", () => {
    it("parses all 6 Pokemon from Gen 1 input", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        expect(result).toHaveLength(6);
    });

    it("parses Pokemon without nickname or gender correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        expect(result[0].species).toBe("Alakazam");
        expect(result[0].nickname).toBeUndefined();
    });

    it("parses Pokemon with nickname and gender suffix correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        // Chance (Chansey) (F)
        expect(result[1].nickname).toBe("Chance");
        expect(result[1].species).toBe("Chansey");
        // Mike (Nidoran-M) (M)
        expect(result[2].nickname).toBe("Mike");
        expect(result[2].species).toBe("Nidoran-M");
    });

    it("parses Pokemon with nickname but no gender suffix correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        // Moo (Mew)
        expect(result[3].nickname).toBe("Moo");
        expect(result[3].species).toBe("Mew");
    });

    it("parses Pokemon with gender suffix but no nickname correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        // Nidoran-F (F)
        expect(result[4].species).toBe("Nidoran-F");
        expect(result[4].nickname).toBeUndefined();
    });

    it("parses 'No Ability' correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.ability).toBe("No Ability");
        });
    });

    it("parses moves correctly for Gen 1 Pokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        expect(result[0].moves).toEqual(["Body Slam", "Reflect", "Psychic"]);
        expect(result[1].moves).toEqual(["Counter", "Hyper Beam", "Rest", "Sing"]);
        expect(result[2].moves).toEqual(["Thunderbolt", "Double Kick", "Thunder", "Rest"]);
        expect(result[3].moves).toEqual(["Fire Blast", "Counter", "Rock Slide", "Reflect"]);
        expect(result[4].moves).toEqual(["Rest", "Thunder", "Thunderbolt", "Double Kick"]);
        expect(result[5].moves).toEqual(["Rest", "Thunder", "Thunderbolt", "Drill Peck"]);
    });

    it("parses Serious nature correctly", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        expect(result[4].nature).toBe("Serious");
        expect(result[5].nature).toBe("Serious");
    });

    it("does not have Tera Types for Gen 1 Pokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.teraType).toBeUndefined();
        });
    });

    it("does not have held items for Gen 1 Pokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.item).toBeUndefined();
        });
    });

    it("sets status to Team for all Gen 1 Pokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.status).toBe("Team");
        });
    });

    it("assigns sequential positions starting from 0", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        result.forEach((pokemon, index) => {
            expect(pokemon.position).toBe(index);
        });
    });

    it("parses species names that exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        const expectedSpecies = ["Alakazam", "Chansey", "Nidoran-M", "Mew", "Nidoran-F", "Zapdos"];
        
        result.forEach((pokemon, index) => {
            // Note: Nidoran-M and Nidoran-F are Showdown format, actual list uses Nidoran♂ and Nidoran♀
            if (pokemon.species === "Nidoran-M") {
                expect(listOfPokemon).toContain("Nidoran♂");
            } else if (pokemon.species === "Nidoran-F") {
                expect(listOfPokemon).toContain("Nidoran♀");
            } else {
                expect(listOfPokemon).toContain(pokemon.species);
            }
            expect(pokemon.species).toBe(expectedSpecies[index]);
        });
    });
});

const gen2ShowdownInput = `Alakazam (F) @ Black Belt  
Ability: No Ability  
IVs: 14 HP / 24 Atk / 26 Def  
- Body Slam  
- Reflect  
- Psychic  
- Hidden Power [Flying]  

Chance (Chansey) @ Gold Berry  
Ability: No Ability  
Level: 50  
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe  
Serious Nature  
- Blizzard  
- Hyper Beam  
- Rest  
- Sing  

Plark (Unown-P) @ Black Belt  
Ability: No Ability  
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe  
Serious Nature  
IVs: 14 HP / 28 Atk  
- Hidden Power [Electric]  

Moo (Mew)  
Ability: No Ability  
- Fire Blast  
- Counter  
- Rock Slide  
- Reflect  

Nidoran-F (F)  
Ability: No Ability  
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 Spe  
Serious Nature  
- Rest  
- Thunder  
- Thunderbolt  
- Double Kick  

Mr. Mime @ Black Glasses  
Ability: No Ability  
Shiny: Yes  
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 36 Spe  
Serious Nature  
IVs: 2 HP / 28 Atk / 28 Def / 0 Spe  
- Body Slam  
- Double-Edge  
- Hidden Power [Grass]  
- Hidden Power [Grass]  `;

describe("parseShowdownFormat with Gen 2 style input", () => {
    it("parses all 6 Pokemon from Gen 2 input", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result).toHaveLength(6);
    });

    it("parses Pokemon with gender suffix and item correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        // Alakazam (F) @ Black Belt
        expect(result[0].species).toBe("Alakazam");
        expect(result[0].nickname).toBeUndefined();
        expect(result[0].item).toBe("Black Belt");
    });

    it("parses Pokemon with nickname and item correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        // Chance (Chansey) @ Gold Berry
        expect(result[1].nickname).toBe("Chance");
        expect(result[1].species).toBe("Chansey");
        expect(result[1].item).toBe("Gold Berry");
    });

    it("parses Unown form correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        // Plark (Unown-P) @ Black Belt
        expect(result[2].nickname).toBe("Plark");
        expect(result[2].species).toBe("Unown-P");
        expect(result[2].item).toBe("Black Belt");
    });

    it("parses Pokemon with period in name correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        // Mr. Mime @ Black Glasses
        expect(result[5].species).toBe("Mr. Mime");
        expect(result[5].nickname).toBeUndefined();
        expect(result[5].item).toBe("Black Glasses");
    });

    it("parses shiny status correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result[5].shiny).toBe(true);
        expect(result[0].shiny).toBeUndefined();
    });

    it("parses level correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result[1].level).toBe(50);
        expect(result[0].level).toBeUndefined();
    });

    it("parses Hidden Power with type correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result[0].moves).toContain("Hidden Power [Flying]");
        expect(result[2].moves).toContain("Hidden Power [Electric]");
        expect(result[5].moves).toContain("Hidden Power [Grass]");
    });

    it("parses moves correctly for all Pokemon", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result[0].moves).toEqual(["Body Slam", "Reflect", "Psychic", "Hidden Power [Flying]"]);
        expect(result[1].moves).toEqual(["Blizzard", "Hyper Beam", "Rest", "Sing"]);
        expect(result[2].moves).toEqual(["Hidden Power [Electric]"]);
        expect(result[3].moves).toEqual(["Fire Blast", "Counter", "Rock Slide", "Reflect"]);
        expect(result[4].moves).toEqual(["Rest", "Thunder", "Thunderbolt", "Double Kick"]);
        expect(result[5].moves).toEqual(["Body Slam", "Double-Edge", "Hidden Power [Grass]", "Hidden Power [Grass]"]);
    });

    it("allows duplicate moves", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        // Mr. Mime has Hidden Power [Grass] twice
        const hiddenPowerCount = result[5].moves?.filter(m => m === "Hidden Power [Grass]").length;
        expect(hiddenPowerCount).toBe(2);
    });

    it("parses abilities correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.ability).toBe("No Ability");
        });
    });

    it("parses natures correctly", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        expect(result[0].nature).toBeUndefined();
        expect(result[1].nature).toBe("Serious");
        expect(result[2].nature).toBe("Serious");
        expect(result[3].nature).toBeUndefined();
        expect(result[4].nature).toBe("Serious");
        expect(result[5].nature).toBe("Serious");
    });

    it("sets status to Team for all Pokemon", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.status).toBe("Team");
        });
    });

    it("generates unique IDs for each Pokemon", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        const ids = result.map((p) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(result.length);
    });

    it("parses species names that exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        const expectedSpecies = ["Alakazam", "Chansey", "Unown-P", "Mew", "Nidoran-F", "Mr. Mime"];
        
        result.forEach((pokemon, index) => {
            // Handle Showdown format variations
            if (pokemon.species === "Nidoran-F") {
                expect(listOfPokemon).toContain("Nidoran♀");
            } else if (pokemon.species === "Unown-P") {
                // Unown forms use base "Unown" in the list
                expect(listOfPokemon).toContain("Unown");
            } else {
                expect(listOfPokemon).toContain(pokemon.species);
            }
            expect(pokemon.species).toBe(expectedSpecies[index]);
        });
    });
});

const gen3ShowdownInput = `Xavier (Unown-X) @ Lum Berry  
Ability: Levitate  
Level: 1  
EVs: 4 Atk / 252 SpA / 252 Spe  
Hasty Nature  
IVs: 0 Atk  
- Hidden Power [Electric]  

Castform @ Leftovers  
Ability: Forecast  
Level: 3  
Happiness: 0  
EVs: 252 HP / 252 Atk / 4 SpA  
Lonely Nature  
IVs: 30 Def / 30 SpA / 30 SpD / 30 Spe  
- Double-Edge  
- Frustration  
- Hidden Power [Grass]  
- Hidden Power [Fighting]  

Articuno @ Twisted Spoon  
Ability: Pressure  
Happiness: 0  
EVs: 4 Atk / 252 SpA / 252 Spe  
Hasty Nature  
IVs: 30 Atk / 30 SpA  
- Extrasensory  
- Frustration  
- Hidden Power [Fire]  
- Hidden Power [Grass]  

Starmie @ Macho Brace  
Ability: Natural Cure  
EVs: 252 Atk / 4 SpA / 252 Spe  
Hasty Nature  
- Double-Edge  
- Facade  
- Hidden Power [Fighting]  
- Hydro Pump  

Slaking (F) @ Leftovers  
Ability: Truant  
Shiny: Yes  
EVs: 252 HP / 252 Atk / 4 SpA  
Naughty Nature  
- Blizzard  
- Brick Break  
- Double-Edge  
- Mud-Slap  

Charizard (M) @ Leftovers  
Ability: Blaze  
Shiny: Yes  
EVs: 252 Atk / 4 SpA / 252 Spe  
Lonely Nature  
IVs: 9 Atk / 27 SpD  
- Counter  
- Dragon Dance  
- Fire Punch  
- Focus Punch  `;

describe("parseShowdownFormat with Gen 3 style input", () => {
    it("parses all 6 Pokemon from Gen 3 input", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result).toHaveLength(6);
    });

    it("parses Pokemon with nickname and Unown form correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        // Xavier (Unown-X) @ Lum Berry
        expect(result[0].nickname).toBe("Xavier");
        expect(result[0].species).toBe("Unown-X");
        expect(result[0].item).toBe("Lum Berry");
    });

    it("parses Pokemon without nickname correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        // Castform @ Leftovers
        expect(result[1].species).toBe("Castform");
        expect(result[1].nickname).toBeUndefined();
        expect(result[1].item).toBe("Leftovers");
    });

    it("parses Pokemon with gender suffix and item correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        // Slaking (F) @ Leftovers
        expect(result[4].species).toBe("Slaking");
        expect(result[4].nickname).toBeUndefined();
        expect(result[4].item).toBe("Leftovers");
        // Charizard (M) @ Leftovers
        expect(result[5].species).toBe("Charizard");
        expect(result[5].nickname).toBeUndefined();
        expect(result[5].item).toBe("Leftovers");
    });

    it("parses various abilities correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].ability).toBe("Levitate");
        expect(result[1].ability).toBe("Forecast");
        expect(result[2].ability).toBe("Pressure");
        expect(result[3].ability).toBe("Natural Cure");
        expect(result[4].ability).toBe("Truant");
        expect(result[5].ability).toBe("Blaze");
    });

    it("parses levels correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].level).toBe(1);
        expect(result[1].level).toBe(3);
        expect(result[2].level).toBeUndefined();
        expect(result[3].level).toBeUndefined();
    });

    it("parses shiny status correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].shiny).toBeUndefined();
        expect(result[1].shiny).toBeUndefined();
        expect(result[4].shiny).toBe(true);
        expect(result[5].shiny).toBe(true);
    });

    it("parses various natures correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].nature).toBe("Hasty");
        expect(result[1].nature).toBe("Lonely");
        expect(result[2].nature).toBe("Hasty");
        expect(result[3].nature).toBe("Hasty");
        expect(result[4].nature).toBe("Naughty");
        expect(result[5].nature).toBe("Lonely");
    });

    it("parses various held items correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].item).toBe("Lum Berry");
        expect(result[1].item).toBe("Leftovers");
        expect(result[2].item).toBe("Twisted Spoon");
        expect(result[3].item).toBe("Macho Brace");
        expect(result[4].item).toBe("Leftovers");
        expect(result[5].item).toBe("Leftovers");
    });

    it("parses moves with multiple Hidden Power types correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        // Castform has Hidden Power [Grass] and Hidden Power [Fighting]
        expect(result[1].moves).toContain("Hidden Power [Grass]");
        expect(result[1].moves).toContain("Hidden Power [Fighting]");
        // Articuno has Hidden Power [Fire] and Hidden Power [Grass]
        expect(result[2].moves).toContain("Hidden Power [Fire]");
        expect(result[2].moves).toContain("Hidden Power [Grass]");
    });

    it("parses all moves correctly", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        expect(result[0].moves).toEqual(["Hidden Power [Electric]"]);
        expect(result[1].moves).toEqual(["Double-Edge", "Frustration", "Hidden Power [Grass]", "Hidden Power [Fighting]"]);
        expect(result[2].moves).toEqual(["Extrasensory", "Frustration", "Hidden Power [Fire]", "Hidden Power [Grass]"]);
        expect(result[3].moves).toEqual(["Double-Edge", "Facade", "Hidden Power [Fighting]", "Hydro Pump"]);
        expect(result[4].moves).toEqual(["Blizzard", "Brick Break", "Double-Edge", "Mud-Slap"]);
        expect(result[5].moves).toEqual(["Counter", "Dragon Dance", "Fire Punch", "Focus Punch"]);
    });

    it("sets status to Team for all Pokemon", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.status).toBe("Team");
        });
    });

    it("generates unique IDs for each Pokemon", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        const ids = result.map((p) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(result.length);
    });

    it("parses species names that exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        const expectedSpecies = ["Unown-X", "Castform", "Articuno", "Starmie", "Slaking", "Charizard"];
        
        result.forEach((pokemon, index) => {
            // Handle Unown forms - base "Unown" is in the list
            if (pokemon.species.startsWith("Unown-")) {
                expect(listOfPokemon).toContain("Unown");
            } else {
                expect(listOfPokemon).toContain(pokemon.species);
            }
            expect(pokemon.species).toBe(expectedSpecies[index]);
        });
    });
});

const gen4ShowdownInput = `Burmy-Sandy  
Ability: Shed Skin  
Relaxed Nature  
- Hidden Power [Grass]  
- Protect  
- Bug Bite  

Burmy-Trash (F) @ Choice Scarf  
Ability: Shed Skin  
Level: 33  
Happiness: 0  
IVs: 0 Atk  
- Protect  

Shellos-East @ Choice Scarf  
Ability: Sticky Hold  
Shiny: Yes  
Happiness: 0  
IVs: 3 Atk / 30 SpA  
- Blizzard  
- Counter  
- Hidden Power [Electric]  
- Earth Power  

Shellos @ Choice Scarf  
Ability: Sticky Hold  
EVs: 252 Atk / 4 SpA / 252 Spe  
Hasty Nature  
IVs: 30 HP / 2 Atk / 30 SpA / 30 SpD / 30 Spe  
- Curse  
- Body Slam  
- Facade  
- Hidden Power [Fighting]  

Rotom-Heat @ Choice Scarf  
Ability: Levitate  
Shiny: Yes  
Happiness: 0  
EVs: 4 Atk / 252 SpA / 252 Spe  
Hasty Nature  
- Discharge  
- Frustration  
- Light Screen  
- Protect  

Rotom-Frost @ Focus Sash  
Ability: Levitate  
EVs: 252 SpA / 4 SpD / 252 Spe  
Timid Nature  
IVs: 2 Atk / 30 SpA  
- Discharge  
- Hidden Power [Fighting]  
- Pain Split  
- Hidden Power [Grass]  `;

describe("parseShowdownFormat with Gen 4 style input (forms)", () => {
    it("parses all 6 Pokemon from Gen 4 input", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result).toHaveLength(6);
    });

    it("parses Pokemon with form suffix correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        // Burmy-Sandy
        expect(result[0].species).toBe("Burmy-Sandy");
        expect(result[0].nickname).toBeUndefined();
        // Shellos-East
        expect(result[2].species).toBe("Shellos-East");
        expect(result[2].nickname).toBeUndefined();
        // Rotom-Heat
        expect(result[4].species).toBe("Rotom-Heat");
        expect(result[4].nickname).toBeUndefined();
        // Rotom-Frost
        expect(result[5].species).toBe("Rotom-Frost");
        expect(result[5].nickname).toBeUndefined();
    });

    it("parses Pokemon with form suffix and gender correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        // Burmy-Trash (F) @ Choice Scarf
        expect(result[1].species).toBe("Burmy-Trash");
        expect(result[1].nickname).toBeUndefined();
        expect(result[1].item).toBe("Choice Scarf");
    });

    it("parses base form Pokemon without suffix correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        // Shellos (base form) vs Shellos-East
        expect(result[3].species).toBe("Shellos");
        expect(result[3].nickname).toBeUndefined();
        expect(result[3].item).toBe("Choice Scarf");
    });

    it("parses abilities correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].ability).toBe("Shed Skin");
        expect(result[1].ability).toBe("Shed Skin");
        expect(result[2].ability).toBe("Sticky Hold");
        expect(result[3].ability).toBe("Sticky Hold");
        expect(result[4].ability).toBe("Levitate");
        expect(result[5].ability).toBe("Levitate");
    });

    it("parses natures correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].nature).toBe("Relaxed");
        expect(result[1].nature).toBeUndefined();
        expect(result[2].nature).toBeUndefined();
        expect(result[3].nature).toBe("Hasty");
        expect(result[4].nature).toBe("Hasty");
        expect(result[5].nature).toBe("Timid");
    });

    it("parses levels correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].level).toBeUndefined();
        expect(result[1].level).toBe(33);
    });

    it("parses shiny status correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].shiny).toBeUndefined();
        expect(result[1].shiny).toBeUndefined();
        expect(result[2].shiny).toBe(true);
        expect(result[4].shiny).toBe(true);
    });

    it("parses held items correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].item).toBeUndefined();
        expect(result[1].item).toBe("Choice Scarf");
        expect(result[2].item).toBe("Choice Scarf");
        expect(result[3].item).toBe("Choice Scarf");
        expect(result[4].item).toBe("Choice Scarf");
        expect(result[5].item).toBe("Focus Sash");
    });

    it("parses moves correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        expect(result[0].moves).toEqual(["Hidden Power [Grass]", "Protect", "Bug Bite"]);
        expect(result[1].moves).toEqual(["Protect"]);
        expect(result[2].moves).toEqual(["Blizzard", "Counter", "Hidden Power [Electric]", "Earth Power"]);
        expect(result[3].moves).toEqual(["Curse", "Body Slam", "Facade", "Hidden Power [Fighting]"]);
        expect(result[4].moves).toEqual(["Discharge", "Frustration", "Light Screen", "Protect"]);
        expect(result[5].moves).toEqual(["Discharge", "Hidden Power [Fighting]", "Pain Split", "Hidden Power [Grass]"]);
    });

    it("parses moves with multiple Hidden Power types correctly", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        // Rotom-Frost has Hidden Power [Fighting] and Hidden Power [Grass]
        expect(result[5].moves).toContain("Hidden Power [Fighting]");
        expect(result[5].moves).toContain("Hidden Power [Grass]");
    });

    it("sets status to Team for all Pokemon", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        result.forEach((pokemon) => {
            expect(pokemon.status).toBe("Team");
        });
    });

    it("generates unique IDs for each Pokemon", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        const ids = result.map((p) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(result.length);
    });

    it("parses species names that exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        const expectedSpecies = ["Burmy-Sandy", "Burmy-Trash", "Shellos-East", "Shellos", "Rotom-Heat", "Rotom-Frost"];
        
        result.forEach((pokemon, index) => {
            // Handle form variations - base forms are in the list
            if (pokemon.species.startsWith("Burmy-")) {
                expect(listOfPokemon).toContain("Burmy");
            } else if (pokemon.species.startsWith("Shellos-")) {
                expect(listOfPokemon).toContain("Shellos");
            } else if (pokemon.species.startsWith("Rotom-")) {
                expect(listOfPokemon).toContain("Rotom");
            } else {
                expect(listOfPokemon).toContain(pokemon.species);
            }
            expect(pokemon.species).toBe(expectedSpecies[index]);
        });
    });
});

describe("isValidShowdownFormat", () => {
    it("returns true for valid Showdown format with ability", () => {
        const input = `Pikachu
Ability: Static`;
        expect(isValidShowdownFormat(input)).toBe(true);
    });

    it("returns true for valid Showdown format with moves", () => {
        const input = `Pikachu
- Thunderbolt
- Quick Attack`;
        expect(isValidShowdownFormat(input)).toBe(true);
    });

    it("returns true for valid Showdown format with nature", () => {
        const input = `Pikachu
Timid Nature`;
        expect(isValidShowdownFormat(input)).toBe(true);
    });

    it("returns false for empty string", () => {
        expect(isValidShowdownFormat("")).toBe(false);
    });

    it("returns false for whitespace-only string", () => {
        expect(isValidShowdownFormat("   \n\n   ")).toBe(false);
    });

    it("returns false for plain text without Showdown patterns", () => {
        expect(isValidShowdownFormat("Just some random text")).toBe(false);
    });

    it("returns true for the full test input", () => {
        expect(isValidShowdownFormat(showdownInput)).toBe(true);
    });
});

/**
 * Maps Showdown format species names to the base form name used in listOfPokemon.
 * This handles form suffixes, gender symbols, and other format differences.
 */
function getBaseSpecies(species: string): string {
    // Handle Nidoran gender variations
    if (species === "Nidoran-M") return "Nidoran♂";
    if (species === "Nidoran-F") return "Nidoran♀";
    
    // Handle form suffixes - extract base name
    const formPatterns = [
        /^(Unown)-[A-Z]$/,           // Unown-X -> Unown
        /^(Burmy)-(Sandy|Plant|Trash)$/,  // Burmy-Sandy -> Burmy
        /^(Wormadam)-(Sandy|Plant|Trash)$/,
        /^(Shellos)-(East|West)$/,   // Shellos-East -> Shellos
        /^(Gastrodon)-(East|West)$/,
        /^(Rotom)-(Heat|Wash|Frost|Fan|Mow)$/,  // Rotom-Heat -> Rotom
        /^(Giratina)-(Origin|Altered)$/,
        /^(Shaymin)-(Sky|Land)$/,
        /^(Deoxys)-(Attack|Defense|Speed|Normal)$/,
        /^(Castform)-(Sunny|Rainy|Snowy)$/,
        /^(Kyurem)-(Black|White)$/,
        /^(Meloetta)-(Aria|Pirouette)$/,
        /^(Tornadus|Thundurus|Landorus|Enamorus)-(Incarnate|Therian)$/,
        /^(Basculin)-(Red-Striped|Blue-Striped|White-Striped)$/,
        /^(Darmanitan)-(Standard|Zen|Galar|Galar-Zen)$/,
        /^(Oricorio)-(Baile|Pom-Pom|Pa'u|Sensu)$/,
        /^(Lycanroc)-(Midday|Midnight|Dusk)$/,
        /^(Wishiwashi)-(Solo|School)$/,
        /^(Minior)-(Meteor|Core)$/,
        /^(Mimikyu)-(Disguised|Busted)$/,
        /^(Necrozma)-(Dusk-Mane|Dawn-Wings|Ultra)$/,
        /^(Zacian|Zamazenta)-(Crowned|Hero)$/,
        /^(Urshifu)-(Single-Strike|Rapid-Strike)$/,
        /^(Calyrex)-(Ice-Rider|Shadow-Rider)$/,
        /^(Indeedee)-(M|F)$/,
        /^(Basculegion)-(M|F)$/,
        /^(Oinkologne)-(M|F)$/,
        /^(Meowstic)-(M|F)$/,
        /^(Tatsugiri)-(Curly|Droopy|Stretchy)$/,
        /^(Squawkabilly)-(Green|Blue|Yellow|White)$/,
        /^(Palafin)-(Zero|Hero)$/,
        /^(Maushold)-(Family-of-Three|Family-of-Four)$/,
        /^(Dudunsparce)-(Two-Segment|Three-Segment)$/,
        /^(Gimmighoul)-(Chest|Roaming)$/,
        /^(Poltchageist|Sinistcha)-(Counterfeit|Artisan)$/,
        /^(Ogerpon)-(Teal-Mask|Wellspring-Mask|Hearthflame-Mask|Cornerstone-Mask)$/,
        /^(Terapagos)-(Normal|Terastal|Stellar)$/,
    ];
    
    for (const pattern of formPatterns) {
        const match = species.match(pattern);
        if (match) {
            return match[1]; // Return the base form name
        }
    }
    
    return species;
}

describe("Species validation against listOfPokemon", () => {
    it("validates all species from modern Showdown input exist in listOfPokemon", () => {
        const result = parseShowdownFormat(showdownInput);
        const expectedMapping = [
            { parsed: "Alomomola", base: "Alomomola" },
            { parsed: "Ceruledge", base: "Ceruledge" },
            { parsed: "Cinderace", base: "Cinderace" },
            { parsed: "Chien-Pao", base: "Chien-Pao" },
            { parsed: "Iron Boulder", base: "Iron Boulder" },
            { parsed: "Azumarill", base: "Azumarill" },
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            expect(listOfPokemon).toContain(baseSpecies);
            expect(pokemon.species).toBe(expectedMapping[index].parsed);
            expect(baseSpecies).toBe(expectedMapping[index].base);
        });
    });

    it("validates all species from Gen 1 input exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        const expectedMapping = [
            { parsed: "Alakazam", base: "Alakazam" },
            { parsed: "Chansey", base: "Chansey" },
            { parsed: "Nidoran-M", base: "Nidoran♂" },
            { parsed: "Mew", base: "Mew" },
            { parsed: "Nidoran-F", base: "Nidoran♀" },
            { parsed: "Zapdos", base: "Zapdos" },
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            expect(listOfPokemon).toContain(baseSpecies);
            expect(pokemon.species).toBe(expectedMapping[index].parsed);
            expect(baseSpecies).toBe(expectedMapping[index].base);
        });
    });

    it("validates all species from Gen 2 input exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        const expectedMapping = [
            { parsed: "Alakazam", base: "Alakazam" },
            { parsed: "Chansey", base: "Chansey" },
            { parsed: "Unown-P", base: "Unown" },
            { parsed: "Mew", base: "Mew" },
            { parsed: "Nidoran-F", base: "Nidoran♀" },
            { parsed: "Mr. Mime", base: "Mr. Mime" },
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            expect(listOfPokemon).toContain(baseSpecies);
            expect(pokemon.species).toBe(expectedMapping[index].parsed);
            expect(baseSpecies).toBe(expectedMapping[index].base);
        });
    });

    it("validates all species from Gen 3 input exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        const expectedMapping = [
            { parsed: "Unown-X", base: "Unown" },
            { parsed: "Castform", base: "Castform" },
            { parsed: "Articuno", base: "Articuno" },
            { parsed: "Starmie", base: "Starmie" },
            { parsed: "Slaking", base: "Slaking" },
            { parsed: "Charizard", base: "Charizard" },
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            expect(listOfPokemon).toContain(baseSpecies);
            expect(pokemon.species).toBe(expectedMapping[index].parsed);
            expect(baseSpecies).toBe(expectedMapping[index].base);
        });
    });

    it("validates all species from Gen 4 input exist in listOfPokemon", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        const expectedMapping = [
            { parsed: "Burmy-Sandy", base: "Burmy" },
            { parsed: "Burmy-Trash", base: "Burmy" },
            { parsed: "Shellos-East", base: "Shellos" },
            { parsed: "Shellos", base: "Shellos" },
            { parsed: "Rotom-Heat", base: "Rotom" },
            { parsed: "Rotom-Frost", base: "Rotom" },
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            expect(listOfPokemon).toContain(baseSpecies);
            expect(pokemon.species).toBe(expectedMapping[index].parsed);
            expect(baseSpecies).toBe(expectedMapping[index].base);
        });
    });

    it("correctly maps Showdown Nidoran formats to listOfPokemon symbols", () => {
        expect(getBaseSpecies("Nidoran-M")).toBe("Nidoran♂");
        expect(getBaseSpecies("Nidoran-F")).toBe("Nidoran♀");
        expect(listOfPokemon).toContain("Nidoran♂");
        expect(listOfPokemon).toContain("Nidoran♀");
    });

    it("correctly maps Unown letter forms to base Unown", () => {
        const unownForms = ["Unown-A", "Unown-B", "Unown-P", "Unown-X", "Unown-Z"];
        unownForms.forEach((form) => {
            expect(getBaseSpecies(form)).toBe("Unown");
        });
        expect(listOfPokemon).toContain("Unown");
    });

    it("correctly maps Rotom forms to base Rotom", () => {
        const rotomForms = ["Rotom-Heat", "Rotom-Wash", "Rotom-Frost", "Rotom-Fan", "Rotom-Mow"];
        rotomForms.forEach((form) => {
            expect(getBaseSpecies(form)).toBe("Rotom");
        });
        expect(listOfPokemon).toContain("Rotom");
    });

    it("correctly maps Burmy forms to base Burmy", () => {
        const burmyForms = ["Burmy-Sandy", "Burmy-Plant", "Burmy-Trash"];
        burmyForms.forEach((form) => {
            expect(getBaseSpecies(form)).toBe("Burmy");
        });
        expect(listOfPokemon).toContain("Burmy");
    });

    it("correctly maps Shellos forms to base Shellos", () => {
        const shellosForms = ["Shellos-East", "Shellos-West"];
        shellosForms.forEach((form) => {
            expect(getBaseSpecies(form)).toBe("Shellos");
        });
        expect(listOfPokemon).toContain("Shellos");
    });

    it("does not modify species that are already in the correct format", () => {
        const directMatches = [
            "Pikachu", "Charizard", "Mewtwo", "Mew", "Ho-Oh", 
            "Mr. Mime", "Chien-Pao", "Iron Boulder", "Type: Null"
        ];
        directMatches.forEach((species) => {
            expect(getBaseSpecies(species)).toBe(species);
            expect(listOfPokemon).toContain(species);
        });
    });
});

describe("Level parsing", () => {
    it("parses Level: 1 correctly", () => {
        const input = `Pikachu
Ability: Static
Level: 1
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(1);
    });

    it("parses Level: 100 correctly", () => {
        const input = `Pikachu
Ability: Static
Level: 100
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(100);
    });

    it("parses Level: 50 correctly", () => {
        const input = `Pikachu
Ability: Static
Level: 50
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(50);
    });

    it("parses various level values correctly", () => {
        const testCases = [
            { level: 5, input: "Level: 5" },
            { level: 10, input: "Level: 10" },
            { level: 25, input: "Level: 25" },
            { level: 33, input: "Level: 33" },
            { level: 55, input: "Level: 55" },
            { level: 91, input: "Level: 91" },
        ];

        testCases.forEach(({ level, input: levelLine }) => {
            const pokemon = `Pikachu
Ability: Static
${levelLine}
- Thunderbolt`;
            const result = parseShowdownFormat(pokemon);
            expect(result[0].level).toBe(level);
        });
    });

    it("returns undefined when no level is specified", () => {
        const input = `Pikachu
Ability: Static
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBeUndefined();
    });

    it("parses level correctly with other attributes", () => {
        const input = `Pikachu @ Light Ball
Ability: Static
Level: 75
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Thunderbolt
- Volt Tackle`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(75);
        expect(result[0].species).toBe("Pikachu");
        expect(result[0].item).toBe("Light Ball");
        expect(result[0].ability).toBe("Static");
        expect(result[0].nature).toBe("Timid");
    });

    it("parses level correctly when appearing after EVs", () => {
        const input = `Pikachu
Ability: Static
EVs: 252 SpA / 252 Spe
Level: 42
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(42);
    });

    it("parses level correctly when appearing before EVs", () => {
        const input = `Pikachu
Ability: Static
Level: 42
EVs: 252 SpA / 252 Spe
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(42);
    });

    it("parses level correctly with Shiny attribute", () => {
        const input = `Pikachu
Ability: Static
Shiny: Yes
Level: 88
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(88);
        expect(result[0].shiny).toBe(true);
    });

    it("parses level correctly with Happiness attribute", () => {
        const input = `Pikachu
Ability: Static
Level: 60
Happiness: 0
- Frustration`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(60);
    });

    it("parses level correctly with Tera Type", () => {
        const input = `Pikachu
Ability: Static
Tera Type: Electric
Level: 77
- Thunderbolt`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(77);
        expect(result[0].teraType).toBe(Types.Electric);
    });

    it("parses levels correctly for multiple Pokemon", () => {
        const input = `Pikachu
Ability: Static
Level: 25
- Thunderbolt

Charizard
Ability: Blaze
Level: 50
- Flamethrower

Mewtwo
Ability: Pressure
Level: 100
- Psychic

Bulbasaur
Ability: Overgrow
- Vine Whip`;
        const result = parseShowdownFormat(input);
        expect(result[0].level).toBe(25);
        expect(result[1].level).toBe(50);
        expect(result[2].level).toBe(100);
        expect(result[3].level).toBeUndefined();
    });

    it("correctly parses levels from Gen 3 input", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        // Xavier (Unown-X) has Level: 1
        expect(result[0].level).toBe(1);
        // Castform has Level: 3
        expect(result[1].level).toBe(3);
        // Others have no level specified
        expect(result[2].level).toBeUndefined();
        expect(result[3].level).toBeUndefined();
        expect(result[4].level).toBeUndefined();
        expect(result[5].level).toBeUndefined();
    });

    it("correctly parses levels from Gen 4 input", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        // Burmy-Sandy has no level
        expect(result[0].level).toBeUndefined();
        // Burmy-Trash has Level: 33
        expect(result[1].level).toBe(33);
        // Others have no level
        expect(result[2].level).toBeUndefined();
        expect(result[3].level).toBeUndefined();
        expect(result[4].level).toBeUndefined();
        expect(result[5].level).toBeUndefined();
    });

    it("correctly parses level from modern input (Chien-Pao Level: 91)", () => {
        const result = parseShowdownFormat(showdownInput);
        // Chien-Pao has Level: 91
        expect(result[3].level).toBe(91);
        // Others have no level
        expect(result[0].level).toBeUndefined();
        expect(result[1].level).toBeUndefined();
        expect(result[2].level).toBeUndefined();
        expect(result[4].level).toBeUndefined();
        expect(result[5].level).toBeUndefined();
    });
});

describe("Type validation against matchSpeciesToTypes", () => {
    it("validates types for modern Showdown input Pokemon", () => {
        const expectedTypes: Record<string, [Types, Types]> = {
            "Alomomola": [Types.Water, Types.Water],
            "Ceruledge": [Types.Fire, Types.Ghost],
            "Cinderace": [Types.Fire, Types.Fire],
            "Chien-Pao": [Types.Dark, Types.Ice],
            "Iron Boulder": [Types.Rock, Types.Psychic],
            "Azumarill": [Types.Water, Types.Fairy],
        };

        Object.entries(expectedTypes).forEach(([species, expected]) => {
            const types = matchSpeciesToTypes(species as Species);
            expect(types).toEqual(expected);
        });
    });

    it("validates types for Gen 1 Pokemon", () => {
        const expectedTypes: Record<string, [Types, Types]> = {
            "Alakazam": [Types.Psychic, Types.Psychic],
            "Chansey": [Types.Normal, Types.Normal],
            "Nidoran♂": [Types.Poison, Types.Poison],
            "Mew": [Types.Psychic, Types.Psychic],
            "Nidoran♀": [Types.Poison, Types.Poison],
            "Zapdos": [Types.Electric, Types.Flying],
        };

        Object.entries(expectedTypes).forEach(([species, expected]) => {
            const types = matchSpeciesToTypes(species as Species);
            expect(types).toEqual(expected);
        });
    });

    it("validates types for Gen 2 Pokemon", () => {
        const expectedTypes: Record<string, [Types, Types]> = {
            "Alakazam": [Types.Psychic, Types.Psychic],
            "Chansey": [Types.Normal, Types.Normal],
            "Unown": [Types.Psychic, Types.Psychic],
            "Mew": [Types.Psychic, Types.Psychic],
            "Mr. Mime": [Types.Psychic, Types.Fairy],
        };

        Object.entries(expectedTypes).forEach(([species, expected]) => {
            const types = matchSpeciesToTypes(species as Species);
            expect(types).toEqual(expected);
        });
    });

    it("validates types for Gen 3 Pokemon", () => {
        const expectedTypes: Record<string, [Types, Types]> = {
            "Unown": [Types.Psychic, Types.Psychic],
            "Castform": [Types.Normal, Types.Normal],  // Castform base form is Normal type!
            "Articuno": [Types.Ice, Types.Flying],
            "Starmie": [Types.Water, Types.Psychic],
            "Slaking": [Types.Normal, Types.Normal],
            "Charizard": [Types.Fire, Types.Flying],
        };

        Object.entries(expectedTypes).forEach(([species, expected]) => {
            const types = matchSpeciesToTypes(species as Species);
            expect(types).toEqual(expected);
        });
    });

    it("validates types for Gen 4 Pokemon with forms", () => {
        const expectedTypes: Record<string, [Types, Types]> = {
            "Burmy": [Types.Bug, Types.Bug],
            "Shellos": [Types.Water, Types.Water],
            "Rotom": [Types.Electric, Types.Ghost],
        };

        Object.entries(expectedTypes).forEach(([species, expected]) => {
            const types = matchSpeciesToTypes(species as Species);
            expect(types).toEqual(expected);
        });
    });

    it("validates that parsed species can be matched to types using getBaseSpecies", () => {
        const result = parseShowdownFormat(showdownInput);
        
        result.forEach((pokemon) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            // Should not throw an error when getting types
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toBeDefined();
            expect(types).toHaveLength(2);
            expect(Object.values(Types)).toContain(types[0]);
            expect(Object.values(Types)).toContain(types[1]);
        });
    });

    it("validates types for all Gen 1 input Pokemon via getBaseSpecies", () => {
        const result = parseShowdownFormat(gen1ShowdownInput);
        const expectedTypes: [Types, Types][] = [
            [Types.Psychic, Types.Psychic],  // Alakazam
            [Types.Normal, Types.Normal],     // Chansey
            [Types.Poison, Types.Poison],     // Nidoran-M -> Nidoran♂
            [Types.Psychic, Types.Psychic],   // Mew
            [Types.Poison, Types.Poison],     // Nidoran-F -> Nidoran♀
            [Types.Electric, Types.Flying],   // Zapdos
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toEqual(expectedTypes[index]);
        });
    });

    it("validates types for all Gen 2 input Pokemon via getBaseSpecies", () => {
        const result = parseShowdownFormat(gen2ShowdownInput);
        const expectedTypes: [Types, Types][] = [
            [Types.Psychic, Types.Psychic],   // Alakazam
            [Types.Normal, Types.Normal],      // Chansey
            [Types.Psychic, Types.Psychic],    // Unown-P -> Unown
            [Types.Psychic, Types.Psychic],    // Mew
            [Types.Poison, Types.Poison],      // Nidoran-F -> Nidoran♀
            [Types.Psychic, Types.Fairy],      // Mr. Mime
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toEqual(expectedTypes[index]);
        });
    });

    it("validates types for all Gen 3 input Pokemon via getBaseSpecies", () => {
        const result = parseShowdownFormat(gen3ShowdownInput);
        const expectedTypes: [Types, Types][] = [
            [Types.Psychic, Types.Psychic],   // Unown-X -> Unown
            [Types.Normal, Types.Normal],      // Castform (base form is Normal!)
            [Types.Ice, Types.Flying],         // Articuno
            [Types.Water, Types.Psychic],      // Starmie
            [Types.Normal, Types.Normal],      // Slaking
            [Types.Fire, Types.Flying],        // Charizard
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toEqual(expectedTypes[index]);
        });
    });

    it("validates types for all Gen 4 input Pokemon via getBaseSpecies", () => {
        const result = parseShowdownFormat(gen4ShowdownInput);
        const expectedTypes: [Types, Types][] = [
            [Types.Bug, Types.Bug],            // Burmy-Sandy -> Burmy
            [Types.Bug, Types.Bug],            // Burmy-Trash -> Burmy
            [Types.Water, Types.Water],        // Shellos-East -> Shellos
            [Types.Water, Types.Water],        // Shellos
            [Types.Electric, Types.Ghost],     // Rotom-Heat -> Rotom
            [Types.Electric, Types.Ghost],     // Rotom-Frost -> Rotom
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toEqual(expectedTypes[index]);
        });
    });

    it("validates types for all modern input Pokemon via getBaseSpecies", () => {
        const result = parseShowdownFormat(showdownInput);
        const expectedTypes: [Types, Types][] = [
            [Types.Water, Types.Water],        // Alomomola
            [Types.Fire, Types.Ghost],         // Ceruledge
            [Types.Fire, Types.Fire],          // Cinderace
            [Types.Dark, Types.Ice],           // Chien-Pao
            [Types.Rock, Types.Psychic],       // Iron Boulder
            [Types.Water, Types.Fairy],        // Azumarill
        ];
        
        result.forEach((pokemon, index) => {
            const baseSpecies = getBaseSpecies(pokemon.species);
            const types = matchSpeciesToTypes(baseSpecies as Species);
            expect(types).toEqual(expectedTypes[index]);
        });
    });
});

