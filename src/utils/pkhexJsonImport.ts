import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { GenderElementProps } from "components/Common/Shared";
import { Types } from "./Types";
import { Game as GameName } from "./data/listOfGames";
import { Species } from "./data/listOfPokemon";
import { matchSpeciesToTypes } from "./formatters/matchSpeciesToTypes";
import { getGameGeneration } from "./getters/getGameGeneration";

type PkhexJsonRow = Record<string, unknown>;

const PLACEHOLDERS = new Set([":--:", "(None)", ""]);

const cleanString = (value: unknown) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return PLACEHOLDERS.has(trimmed) ? undefined : trimmed;
};

const parseNumber = (value: unknown) => {
    const cleaned = cleanString(value);
    if (!cleaned) return undefined;

    const parsed = Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value: unknown) => {
    const cleaned = cleanString(value)?.toLowerCase();
    if (cleaned === "true") return true;
    if (cleaned === "false") return false;
    return undefined;
};

const parseGender = (value: unknown): GenderElementProps => {
    const cleaned = cleanString(value);
    if (cleaned === "M") return "Male";
    if (cleaned === "F") return "Female";
    if (cleaned === "-") return "genderless";
    return undefined;
};

const parseMoves = (row: PkhexJsonRow) =>
    ["Move1", "Move2", "Move3", "Move4"]
        .map((key) => cleanString(row[key]))
        .filter((move): move is string => Boolean(move));

const parseStatus = (row: PkhexJsonRow) => {
    const position = cleanString(row.Position);
    return position?.includes(" @ Party:") ? "Team" : "Boxed";
};

const isPkhexJsonRow = (row: unknown): row is PkhexJsonRow => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;

    const species = cleanString((row as PkhexJsonRow).Species);
    return Boolean(species);
};

const parsePkhexPokemon = (row: PkhexJsonRow, position: number): Pokemon | null => {
    const species = cleanString(row.Species);
    if (!species) return null;

    const gameOfOrigin = cleanString(row.Version) as GameName | undefined;
    const generation = gameOfOrigin ? getGameGeneration(gameOfOrigin) : undefined;
    const types = matchSpeciesToTypes(species as Species, undefined, generation);
    const moves = parseMoves(row);

    return {
        id: uuid(),
        position,
        species,
        nickname: cleanString(row.Nickname),
        status: parseStatus(row),
        gender: parseGender(row.Gender),
        level: parseNumber(row.Level),
        met: cleanString(row.MetLoc),
        metLevel: parseNumber(row.MetLevel),
        nature: cleanString(row.Nature),
        ability: cleanString(row.Ability),
        item: cleanString(row.HeldItem),
        pokeball: cleanString(row.Ball),
        gameOfOrigin,
        shiny: parseBoolean(row.IsShiny),
        egg: parseBoolean(row.IsEgg) ?? false,
        types: types ?? [Types.Normal, Types.Normal],
        moves,
    };
};

export const parsePkhexJsonPokemon = (data: unknown): Pokemon[] | undefined => {
    if (!Array.isArray(data)) return undefined;

    const pokemon = data
        .filter(isPkhexJsonRow)
        .map((row, position) => parsePkhexPokemon(row, position))
        .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));

    return pokemon.length ? pokemon : undefined;
};

export const normalizeImportedJsonData = (data: unknown) => {
    const pkhexPokemon = parsePkhexJsonPokemon(data);
    if (pkhexPokemon) {
        return { pokemon: pkhexPokemon };
    }

    return data;
};
