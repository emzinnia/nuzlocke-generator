/**
 * Search Engine Types
 *
 * Defines AST nodes, tokens, and normalized Pokémon structure for
 * the advanced search system.
 */

import type { Pokemon } from "models";

// ─────────────────────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────────────────────

export type TokenType =
    | "FIELD" // species, type, gender, etc.
    | "COLON" // :
    | "BANG" // !
    | "MINUS" // -
    | "LPAREN" // (
    | "RPAREN" // )
    | "PIPE" // |
    | "OR" // OR keyword
    | "AND" // AND keyword
    | "GT" // >
    | "GTE" // >=
    | "LT" // <
    | "LTE" // <=
    | "EQ" // =
    | "NEQ" // !=
    | "RANGE" // ..
    | "QUOTED_STRING" // "ice beam"
    | "BARE_STRING" // Br, f*l
    | "NUMBER" // 20
    | "EOF";

export interface Token {
    type: TokenType;
    value: string;
    start: number;
    end: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// AST Nodes
// ─────────────────────────────────────────────────────────────────────────────

export type ASTNode =
    | OrNode
    | AndNode
    | NotNode
    | FieldFilterNode
    | BareTermNode;

export interface OrNode {
    type: "OR";
    children: ASTNode[];
}

export interface AndNode {
    type: "AND";
    children: ASTNode[];
}

export interface NotNode {
    type: "NOT";
    child: ASTNode;
}

export type Comparator = ":" | "=" | "!=" | ">" | ">=" | "<" | "<=";

export interface FieldFilterNode {
    type: "FIELD_FILTER";
    field: string; // canonical field name
    comparator: Comparator;
    value: string;
    /** For range queries like level:10..20 */
    rangeEnd?: string;
    /** Whether the value contains wildcards */
    hasWildcard: boolean;
}

export interface BareTermNode {
    type: "BARE_TERM";
    value: string;
    hasWildcard: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse Result
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseError {
    message: string;
    start: number;
    end: number;
}

export interface ParseWarning {
    message: string;
    start: number;
    end: number;
    suggestion?: string;
}

export interface ParseResult {
    ast: ASTNode | null;
    errors: ParseError[];
    warnings: ParseWarning[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalized Pokémon (for fast matching)
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizedPokemon {
    id: string;
    species: string; // lowercase, trimmed
    nickname: string; // lowercase, trimmed
    gender: string; // lowercase
    types: string[]; // lowercase array
    teraType: string; // lowercase
    moves: string[]; // lowercase, whitespace-normalized
    item: string; // lowercase
    ability: string; // lowercase
    nature: string; // lowercase
    level: number;
    metLevel: number;
    status: string; // lowercase (box name)
    forme: string; // lowercase
    game: string; // lowercase
    shiny: boolean;
    egg: boolean;
    hidden: boolean;
    alpha: boolean;
    mvp: boolean;
    gift: boolean;
    notes: string; // lowercase
}

// ─────────────────────────────────────────────────────────────────────────────
// Predicate type
// ─────────────────────────────────────────────────────────────────────────────

export type MatchPredicate = (
    pokemon: Pokemon,
    normalized: NormalizedPokemon,
) => boolean;

// ─────────────────────────────────────────────────────────────────────────────
// Field dictionary
// ─────────────────────────────────────────────────────────────────────────────

/** Maps user-facing field names (and aliases) to canonical field names */
export const FIELD_ALIASES: Record<string, keyof NormalizedPokemon> = {
    // Canonical names
    species: "species",
    nickname: "nickname",
    type: "types",
    types: "types",
    tera: "teraType",
    teratype: "teraType",
    gender: "gender",
    sex: "gender",
    move: "moves",
    moves: "moves",
    item: "item",
    ability: "ability",
    nature: "nature",
    level: "level",
    lvl: "level",
    lv: "level",
    metlevel: "metLevel",
    status: "status",
    box: "status",
    forme: "forme",
    form: "forme",
    game: "game",
    gameoforigin: "game",
    shiny: "shiny",
    egg: "egg",
    hidden: "hidden",
    alpha: "alpha",
    mvp: "mvp",
    gift: "gift",
    notes: "notes",
    name: "nickname",
};

/** Set of all valid canonical field names */
export const VALID_FIELDS = new Set<string>(Object.values(FIELD_ALIASES));

/** Fields that use prefix matching by default */
export const PREFIX_MATCH_FIELDS = new Set<string>(["species", "nickname"]);

/** Fields that are arrays (need "any" matching) */
export const ARRAY_FIELDS = new Set<string>(["types", "moves"]);

/** Fields that are booleans */
export const BOOLEAN_FIELDS = new Set<string>([
    "shiny",
    "egg",
    "hidden",
    "alpha",
    "mvp",
    "gift",
]);

/** Fields that are numeric */
export const NUMERIC_FIELDS = new Set<string>(["level", "metLevel"]);



