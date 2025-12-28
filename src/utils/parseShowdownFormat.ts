import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { Types } from "./Types";
import { Forme } from "./Forme";
import { Generation } from "./getters/getGameGeneration";
import { matchSpeciesToTypes } from "./formatters/matchSpeciesToTypes";
import { Species } from "./data/listOfPokemon";

export interface ParseShowdownOptions {
    startPosition?: number;
    generation?: Generation;
}

export function parseShowdownFormat(
    text: string,
    options: ParseShowdownOptions = {},
): Pokemon[] {
    const { startPosition = 0, generation = Generation.Gen9 } = options;
    const pokemon: Pokemon[] = [];
    const entries = text.trim().split(/\n\s*\n/);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i].trim();
        if (!entry) continue;

        const parsed = parseShowdownEntry(entry, startPosition + i, generation);
        if (parsed) {
            pokemon.push(parsed);
        }
    }

    return pokemon;
}

function parseShowdownEntry(
    entry: string,
    position: number,
    generation: Generation,
): Pokemon | null {
    const lines = entry.split("\n").map((line) => line.trim());
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const { species, nickname, item, forme } = parseFirstLine(firstLine);

    if (!species) return null;

    // Convert Forme enum value to key name for matchSpeciesToTypes
    const formeKey = forme ? (Object.keys(Forme).find(key => Forme[key as keyof typeof Forme] === forme) as keyof typeof Forme) : undefined;
    const types = matchSpeciesToTypes(species as Species, formeKey, generation);

    const pokemon: Pokemon = {
        id: uuid(),
        species,
        nickname: nickname || undefined,
        item: item || undefined,
        forme: forme || undefined,
        types,
        status: "Team",
        position,
        moves: [],
    };

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Ability:")) {
            pokemon.ability = line.replace("Ability:", "").trim();
        } else if (line.startsWith("Tera Type:")) {
            const teraTypeStr = line.replace("Tera Type:", "").trim();
            const teraType = stringToType(teraTypeStr);
            if (teraType) {
                pokemon.teraType = teraType;
            }
        } else if (line.startsWith("Level:")) {
            const levelStr = line.replace("Level:", "").trim();
            const level = parseInt(levelStr, 10);
            if (!isNaN(level)) {
                pokemon.level = level;
            }
        } else if (line.startsWith("Shiny:")) {
            const shinyStr = line.replace("Shiny:", "").trim().toLowerCase();
            pokemon.shiny = shinyStr === "yes" || shinyStr === "true";
        } else if (line.endsWith("Nature")) {
            const nature = line.replace("Nature", "").trim();
            if (nature) {
                pokemon.nature = nature;
            }
        } else if (line.startsWith("-")) {
            let move = line.replace(/^-\s*/, "").trim();
            const hpMatch = move.match(/^Hidden Power \[(.+)\]$/);
            if (hpMatch) {
                move = `HP ${hpMatch[1]}`;
            }
            if (move && pokemon.moves) {
                pokemon.moves.push(move);
            }
        }
    }

    return pokemon;
}

function parseFirstLine(line: string): {
    species: string;
    nickname: string | null;
    item: string | null;
    forme: Forme | undefined;
} {
    let species = "";
    let nickname: string | null = null;
    let item: string | null = null;
    let forme: Forme | undefined = undefined;

    const itemSplit = line.split("@");
    const namePart = itemSplit[0].trim();
    if (itemSplit.length > 1) {
        item = itemSplit[1].trim();
    }

    const fullMatch = namePart.match(/^(.+?)\s*\((.+?)\)\s*\([MF]\)\s*$/);
    if (fullMatch) {
        nickname = fullMatch[1].trim();
        species = fullMatch[2].trim();
    } else {
        const genderMatch = namePart.match(/^(.+?)\s*\([MF]\)\s*$/);
        if (genderMatch) {
            species = genderMatch[1].trim();
        } else {
            const nicknameMatch = namePart.match(/^(.+?)\s*\((.+?)\)\s*$/);
            if (nicknameMatch) {
                nickname = nicknameMatch[1].trim();
                species = nicknameMatch[2].trim();
            } else {
                species = namePart;
            }
        }
    }

    const handled = handleShowdownSpecies(species);
    species = handled.species;
    forme = handled.forme;

    return { species, nickname, item, forme };
}

function handleShowdownSpecies(species: string): { species: string; forme: Forme | undefined } {
    if (species === "Nidoran-M") return { species: "Nidoran♂", forme: undefined };
    if (species === "Nidoran-F") return { species: "Nidoran♀", forme: undefined };

    if (species.includes("-")) {
        const [baseName, formName] = species.split("-", 2);
        const formPokemon = [
            "Burmy", "Wormadam", "Shellos", "Gastrodon", 
            "Rotom", "Basculin", "Deerling", "Sawsbuck",
            "Vivillon", "Flabébé", "Floette", "Florges",
            "Furfrou", "Pumpkaboo", "Gourgeist", "Oricorio",
            "Lycanroc", "Minior", "Toxtricity", "Sinistea",
            "Polteageist", "Alcremie", "Indeedee", "Morpeko",
            "Urshifu", "Basculegion", "Oinkologne", "Maushold",
            "Squawkabilly", "Palafin", "Tatsugiri", "Dudunsparce",
            "Unown", "Castform",
            "Venusaur", "Charizard", "Blastoise", "Alakazam", "Gengar",
            "Kangaskhan", "Pinsir", "Gyarados", "Aerodactyl", "Mewtwo",
            "Ampharos", "Scizor", "Heracross", "Houndoom", "Tyranitar",
            "Blaziken", "Gardevoir", "Mawile", "Aggron", "Medicham",
            "Manectric", "Banette", "Absol", "Latias", "Latios",
            "Garchomp", "Lucario", "Abomasnow", "Gallade", "Diancie",
            "Lopunny", "Salamence", "Metagross", "Rayquaza",
            "Beedrill", "Pidgeot", "Slowbro", "Steelix", "Sceptile",
            "Swampert", "Sableye", "Sharpedo", "Camerupt", "Altaria",
            "Glalie", "Audino",
            "Zygarde",
            "Silvally",
            "Necrozma",
            "Giratina", "Shaymin", "Tornadus", "Thundurus", "Landorus",
            "Kyurem", "Hoopa", "Meloetta", "Keldeo", "Deoxys",
            "Calyrex",
            "Ogerpon",
            "Terapagos"
        ];
        if (formPokemon.includes(baseName)) {
            return { species: baseName, forme: stringToForme(formName) };
        }
        const hyphenatedPokemon = [
            "Nidoran-M", "Nidoran-F", "Mr. Mime", "Ho-Oh",
            "Mime Jr.", "Porygon-Z", "Jangmo-o", "Hakamo-o",
            "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu",
            "Tapu Fini", "Type: Null", "Chi-Yu", "Chien-Pao",
            "Ting-Lu", "Wo-Chien", "Iron Boulder", "Iron Crown"
        ];
        if (hyphenatedPokemon.includes(species)) {
            return { species, forme: undefined };
        }
    }
    return { species, forme: undefined };
}

function stringToForme(formeStr: string): Forme | undefined {
    const formeMap: Record<string, Forme> = {
        "Sandy": Forme.Sandy,
        "Trash": Forme.Trash,
        "Plant": Forme.Plant,
        "East": Forme["East Sea"],
        "West": Forme["West Sea"],
        "Heat": Forme.Heat,
        "Wash": Forme.Wash,
        "Frost": Forme.Frost,
        "Fan": Forme.Fan,
        "Mow": Forme.Mow,
        "Sunny": Forme.Sunny,
        "Rainy": Forme.Rainy,
        "Snowy": Forme.Snowy,
        "Spring": Forme.Spring,
        "Summer": Forme.Summer,
        "Autumn": Forme.Autumn,
        "Winter": Forme.Winter,
        "Baile": Forme.Baile,
        "Pom-Pom": Forme["Pom-Pom"],
        "Pa'u": Forme["Pa'u"],
        "Sensu": Forme.Sensu,
        "Lowkey": Forme.Lowkey,
        "Amped": Forme.AmpedUp,
        "Therian": Forme.Therian,
        "Origin": Forme.Origin,
        "Attack": Forme.Attack,
        "Defense": Forme.Defense,
        "Speed": Forme.Speed,
        "Mega": Forme.Mega,
        "Mega-X": Forme["Mega-X"],
        "Mega-Y": Forme["Mega-Y"],
        "Alola": Forme.Alolan,
        "Galar": Forme.Galarian,
        "Hisui": Forme.Hisuian,
        "Paldea": Forme.Paldean,
        "10%": Forme["10%"],
        "50%": Forme["50%"],
        "Complete": Forme.Complete,
        "Dawn Wings": Forme["Dawn Wings"],
        "Dusk Mane": Forme["Dusk Mane"],
        "Ultra": Forme.Ultra,
        "Sky": Forme.Sky,
        "White": Forme.White,
        "Black": Forme.Black,
        "Ice Rider": Forme.IceRider,
        "Shadow Rider": Forme.ShadowRider,
        "School": Forme.School,
        "Pirouette": Forme.Pirouette,
        "Wellspring": Forme.Wellspring,
        "Heartflame": Forme.Heartflame,
        "Cornerstone": Forme.Cornerstone,
    };
    if (formeStr in formeMap) {
        return formeMap[formeStr];
    }
    if (formeStr.length === 1) {
        const letter = formeStr.toUpperCase();
        if (letter in Forme) {
            return Forme[letter as keyof typeof Forme];
        }
    }
    return undefined;
}

function stringToType(typeStr: string): Types | undefined {
    const normalized = typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();
    if (normalized in Types) {
        return Types[normalized as keyof typeof Types];
    }
    return undefined;
}

export function isValidShowdownFormat(text: string): boolean {
    if (!text || !text.trim()) return false;

    const lines = text.trim().split("\n");
    if (lines.length === 0) return false;

    const firstLine = lines[0].trim();
    if (!firstLine) return false;

    const hasAbility = lines.some((l) => l.trim().startsWith("Ability:"));
    const hasMoves = lines.some((l) => l.trim().startsWith("-"));
    const hasNature = lines.some((l) => l.trim().endsWith("Nature"));

    return hasAbility || hasMoves || hasNature;
}
