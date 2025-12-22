/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import {
    addForme,
    choose,
    styleDefaults,
    matchSpeciesToTypes,
    listOfPokemon,
    speciesToNumber,
    Forme,
    mapTrainerImage,
    Generation,
    typeToColor,
    isEmpty,
} from "utils";
import * as React from "react";
import * as Color from "color";
import { DeepSet } from "../DeepSet";
import { Types } from "../Types";
import { handleMovesGenerationsExceptions } from "utils/handleMovesGenerationExceptions";
import { getGameGeneration } from "utils";
import { gameOfOriginToColor } from "utils/formatters/gameOfOriginToColor";
import { getDeepObject } from "utils";
import { getEncounterMap } from "utils";
import { getMoveType } from "utils";
import { getDisplayNameForTest } from "utils";
import { getGameRegion, Region } from "utils";
import { numberToSpecies } from "utils/formatters/numberToSpecies";
import { capitalize } from "utils/formatters/capitalize";
import { matchNatureToToxtricityForme } from "utils/matchNatureToToxtricityForme";
import { Nature } from "utils/Nature";
import { getAdditionalFormes } from "utils/getters/getAdditionalFormes";
import { getEvolutionLine } from "utils";

const objectPropertiesWhere = (obj: object, filter: any) =>
    Array.from(Object.values(obj)).filter(filter).length;

expect.extend({
    toBeOneOf(received, argument) {
        const validValues = Array.isArray(argument) ? argument : [argument];
        const pass = validValues.includes(received);
        if (pass) {
            return {
                message: () =>
                    `expected ${received} not to be one of [${validValues.join(", ")}]`,
                pass: true,
            };
        }
        return {
            message: () =>
                `expected ${received} to be one of [${validValues.join(", ")}]`,
            pass: false,
        };
    },
});

describe("addForme", () => {
    it("returns an alolan species", () => {
        const forme = addForme("diglett", "Alolan");
        expect(forme).toEqual("alolan-diglett");
    });
    it("returns a mega forme", () => {
        const forme = addForme("alakazam", "Mega");
        expect(forme).toEqual("alakazam-mega");
    });
});

describe("choose", () => {
    it("returns a result in the array", () => {
        const dice = [1, 2, 3, 4, 5, 6];
        const chosenDice = choose<number>(dice);
        for (let i = 0; i < 10; i++) {
            (expect as any)(chosenDice).toBeOneOf(dice);
        }
    });
});

describe("isEmpty", () => {
    it("works with nulls or undefineds", () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
    });

    it("works with empty strings", () => {
        expect(isEmpty("")).toBe(true);
    });

    it("works with empty arrays", () => {
        expect(isEmpty([])).toBe(true);
    });
});

describe("styleDefaults", () => {
    it("is an object with expected values", () => {
        expect(styleDefaults).toHaveProperty("backgroundImage");
        expect(styleDefaults).toHaveProperty("topHeaderColor");
        expect(styleDefaults.editorDarkMode).toBe(false);
        expect(typeof styleDefaults).toBe("object");
        expect(styleDefaults.imageStyle).toBe("round");
        expect(objectPropertiesWhere(styleDefaults, (p) => p === "round")).toBe(
            1,
        );
        expect(objectPropertiesWhere(styleDefaults, (p) => p)).toBe(28);
    });
});

describe("matchSpeciesToType", () => {
    it("returns a type for a Pokemon", () => {
        expect(matchSpeciesToTypes("Bulbasaur")).toEqual(["Grass", "Poison"]);
        expect(matchSpeciesToTypes("Charizard")).toEqual(["Fire", "Flying"]);
        expect(matchSpeciesToTypes("Raichu", "Alolan")).toEqual([
            "Electric",
            "Psychic",
        ]);
        expect(
            matchSpeciesToTypes("Rattata", "Alolan", Generation.Gen7),
        ).toEqual(["Dark", "Normal"]);
        expect(
            matchSpeciesToTypes("Clefairy", undefined, Generation.Gen1),
        ).toEqual(["Normal", "Normal"]);
        expect(
            matchSpeciesToTypes("Togetic", undefined, Generation.Gen1),
        ).toEqual(["Normal", "Flying"]);
        expect(matchSpeciesToTypes("Meowth", "Galarian")).toEqual([
            "Steel",
            "Steel",
        ]);
        expect(matchSpeciesToTypes("Shaymin", "Sky")).toEqual([
            "Grass",
            "Flying",
        ]);
        listOfPokemon.map((pokemon, index) => {
            expect(matchSpeciesToTypes(pokemon).length).toBeGreaterThan(0);
        });
    });

    it.skip("works for every pokemon", () => {
        const noMatches = listOfPokemon.filter(
            (pokemon) => matchSpeciesToTypes(pokemon) == null,
        );
        console.log(noMatches.length);
        console.log(noMatches);
        expect(false).toBe(true);
    });
});

describe("speciesToNumber", () => {
    it("returns a number", () => {
        expect(speciesToNumber("Bulbasaur")).toBe(1);
        expect(speciesToNumber("Zeraora")).toBe(807);
    });
});

describe("DeepSet", () => {
    it("returns an array", () => {
        const d = new DeepSet(["a", "b", "c", "d"]);
        expect(d.toArray()).toEqual(["a", "b", "c", "d"]);
    });

    it("#add", () => {
        const d = new DeepSet([
            { name: "kay" },
            { name: "bebe" },
            { name: "yellow" },
            { name: "bebe", type: "green" },
        ]);
        d.add({ name: "kay" });
        console.log(d);
        expect(d.toArray().length).toBe(4);
    });

    it("#has", () => {
        const d = new DeepSet([
            { name: "kay" },
            { name: "bebe" },
            { name: "yellow" },
            { name: "bebe", type: "green" },
        ]);
        expect(d.has({ name: "bebe", type: "green" })).toBe(true);
    });

    it("#delete", () => {
        const d = new DeepSet([
            { name: "kay" },
            { name: "bebe" },
            { name: "yellow" },
            { name: "bebe", type: "green" },
        ]);
        d.delete({ name: "kay" });
        expect(d.toArray().length).toBe(3);
    });

    it("#cheapCompare", () => {
        const k = { name: "kay" };
        const k2 = { name: "kay" };
        console.log(DeepSet.cheapCompare(k, k2));
        expect(DeepSet.cheapCompare(k, k2)).toBe(true);
    });
});

describe("MapTrainerToImage", () => {
    it("returns an image if it matches", () => {
        const t = mapTrainerImage("Ethan");
        expect(t).toContain("ethan");
        const u = mapTrainerImage("not gonna work");
        expect(u).toBe("not gonna work");
    });
});

describe("TypeToColor", () => {
    it("returns a color", () => {
        expect(typeToColor(Types.Bug)).toBe("#AEE359");
        expect(typeToColor("None")).toBe(null);
    });
});

describe("handleMoveGenerationExceptions", () => {
    it("works for Sand Attack - Gen 1", () => {
        const move = "Sand Attack";
        const generation = Generation.Gen1;
        const originalType = Types.Ground;
        expect(
            handleMovesGenerationsExceptions({
                move,
                generation,
                originalType,
            }),
        ).toBe(Types.Normal);
    });
    it("works for Charm - Gen 3", () => {
        const move = "Charm";
        const generation = Generation.Gen3;
        const originalType = Types.Fairy;
        expect(
            handleMovesGenerationsExceptions({
                move,
                generation,
                originalType,
            }),
        ).toBe(Types.Normal);
    });
    it("works for Ember - Gen 7", () => {
        const move = "Ember";
        const generation = Generation.Gen7;
        const originalType = Types.Fire;
        expect(
            handleMovesGenerationsExceptions({
                move,
                generation,
                originalType,
            }),
        ).toBe(originalType);
    });
});

describe(getGameGeneration.name, () => {
    it("do what it do", () => {
        expect(getGameGeneration("Red")).toBe(Generation.Gen1);
        expect(getGameGeneration("Emerald")).toBe(Generation.Gen3);
        // Yes it's Gen 7 now shut up
        expect(getGameGeneration("Let's Go Eevee")).toBe(Generation.Gen7);
        expect(getGameGeneration("Sword")).toBe(Generation.Gen8);
        expect(getGameGeneration("Platinum")).toBe(Generation.Gen4);
        // Assumes latest gen
        expect(getGameGeneration("Fake Game" as any)).toBe(Generation.Gen8);
    });
});

describe(getGameRegion.name, () => {
    it("returns a region based on game", () => {
        expect(getGameRegion("Red")).toBe(Region.Kanto);
        expect(getGameRegion("Diamond")).toBe(Region.Sinnoh);
        expect(getGameRegion("Sword")).toBe(Region.Galar);
        expect(getGameRegion("Let's Go Eevee")).toBe(Region.Kanto);
    });
});

describe(gameOfOriginToColor.name, () => {
    it("returns a color for games", () => {
        const colors = {
            Red: "rgb(243, 86, 58)",
            Blue: "#3675f8",
            Yellow: "#fdd33c",
        };
        expect(gameOfOriginToColor("Red")).toBe(colors.Red);
        expect(gameOfOriginToColor("Blue")).toBe(colors.Blue);
        expect(gameOfOriginToColor("Yellow")).toBe(colors.Yellow);
    });
    it("returns an empty string for non-games", () => {
        // @ts-expect-error - Testing with invalid game name
        expect(gameOfOriginToColor("Garbage")).toBe("");
    });
});

describe(getDeepObject.name, () => {
    it("returns an object deeply nested by key", () => {
        const subject = {
            pokemon: {
                abra: {
                    kadabra: {
                        alakazam: true,
                    },
                },
            },
        };
        expect(getDeepObject(subject, "alakazam")).toEqual({ alakazam: true });
    });

    it("returns null if the key does not exist", () => {
        const subject = {
            pokemon: {},
        };
        expect(getDeepObject(subject, "arcanine")).toEqual(null);
    });
});

describe(getEncounterMap.name, () => {
    it("returns a proper list of routes given a game", () => {
        const KantoGen1 = getEncounterMap("Red");
        const KantoGen3 = getEncounterMap("FireRed");
        const JohtoGen4 = getEncounterMap("HeartGold");
        expect(KantoGen3.length).toBeGreaterThan(KantoGen1.length);
        expect(JohtoGen4).toContain("Route 29");
    });
});

describe(getMoveType.name, () => {
    it("works for moves that exist & do not", () => {
        const moveA = getMoveType("Fire Blast");
        const moveB = getMoveType("Move That Does Not Exist");
        expect(moveA).toBe(Types.Fire);
        expect(moveB).toBe(Types.Normal);
    });
});

describe(getDisplayNameForTest.name, () => {
    it("returns a formatted string based on class", () => {
        class Component extends React.Component {
            public static displayName = "Component";
            public render() {
                return "Dave";
            }
        }
        expect(getDisplayNameForTest(Component)).toEqual("<Component />");
    });
});

describe(numberToSpecies.name, () => {
    it("returns a number", () => {
        const subject = numberToSpecies(-1);
        const subject2 = numberToSpecies("-1");
        expect(subject).toBe("Bulbasaur");
        expect(subject2).toBe("Bulbasaur");
    });
});

describe(capitalize.name, () => {
    it("returns a capitalized string", () => {
        const subject = capitalize("dog");
        expect(subject).toBe("Dog");
        const subject2 = capitalize("dOG");
        expect(subject2).toBe("DOG");
    });
});

describe(matchNatureToToxtricityForme.name, () => {
    it("returns amped correctly", () => {
        const subject = matchNatureToToxtricityForme(Nature.Adamant);
        expect(subject).toBe("AmpedUp");
    });

    it("returns lowkey correctly", () => {
        const subject = matchNatureToToxtricityForme(Nature.Docile);
        expect(subject).toBe("AmpedUp");
    });

    it("returns lowkey in null case", () => {
        // @ts-expect-error - Testing with undefined nature
        const subject = matchNatureToToxtricityForme(undefined);
        expect(subject).toBe("Lowkey");
    });
});

describe(getAdditionalFormes.name, () => {
    it("matches snapshot for all species", () => {
        const subject = listOfPokemon.map((species) => ({
            [species]: getAdditionalFormes(species),
        }));
        expect(subject).toMatchSnapshot();
    });
});

describe.skip(getEvolutionLine.name, () => {
    it("returns proper data for basic line", () => {
        const subject = getEvolutionLine("Bulbasaur");
        expect(subject).toEqual(["Bulbasaur", "Ivysaur", "Venusaur"]);
    });

    it("returns proper data for a split-evo line", () => {
        const subject = getEvolutionLine("Burmy");
        expect(subject).toEqual(["Burmy", "Wormadam", "Mothim"]);
    });

    it("returns proper data for a split-evo line, multiple lines", () => {
        const subject = getEvolutionLine("Oddish");
        expect(subject).toEqual(["Oddish", "Gloom", "Vileplume", "Bellossom"]);
    });

    it("returns proper data for a split-evo line, final evo", () => {
        const subject = getEvolutionLine("Politoed");
        expect(subject).toEqual([
            "Poliwag",
            "Poliwhirl",
            "Poliwrath",
            "Politoed",
        ]);
    });
});
