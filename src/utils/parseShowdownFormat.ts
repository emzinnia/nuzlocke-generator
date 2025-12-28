import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { Types } from "./Types";

export function parseShowdownFormat(
    text: string,
    startPosition: number = 0,
): Pokemon[] {
    const pokemon: Pokemon[] = [];
    const entries = text.trim().split(/\n\s*\n/);

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i].trim();
        if (!entry) continue;

        const parsed = parseShowdownEntry(entry, startPosition + i);
        if (parsed) {
            pokemon.push(parsed);
        }
    }

    return pokemon;
}

function parseShowdownEntry(
    entry: string,
    position: number,
): Pokemon | null {
    const lines = entry.split("\n").map((line) => line.trim());
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const { species, nickname, item } = parseFirstLine(firstLine);

    if (!species) return null;

    const pokemon: Pokemon = {
        id: uuid(),
        species,
        nickname: nickname || undefined,
        item: item || undefined,
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
            const move = line.replace(/^-\s*/, "").trim();
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
} {
    let species = "";
    let nickname: string | null = null;
    let item: string | null = null;

    const itemSplit = line.split("@");
    const namePart = itemSplit[0].trim();
    if (itemSplit.length > 1) {
        item = itemSplit[1].trim();
    }

    // Check for nickname + species + gender: "Nickname (Species) (M)" or "Nickname (Species) (F)"
    const fullMatch = namePart.match(/^(.+?)\s*\((.+?)\)\s*\([MF]\)\s*$/);
    if (fullMatch) {
        nickname = fullMatch[1].trim();
        species = fullMatch[2].trim();
    } else {
        // Check for gender suffix only: "Species (M)" or "Species (F)"
        const genderMatch = namePart.match(/^(.+?)\s*\([MF]\)\s*$/);
        if (genderMatch) {
            species = genderMatch[1].trim();
        } else {
            // Check for nickname: "Nickname (Species)"
            const nicknameMatch = namePart.match(/^(.+?)\s*\((.+?)\)\s*$/);
            if (nicknameMatch) {
                nickname = nicknameMatch[1].trim();
                species = nicknameMatch[2].trim();
            } else {
                species = namePart;
            }
        }
    }

    return { species, nickname, item };
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

