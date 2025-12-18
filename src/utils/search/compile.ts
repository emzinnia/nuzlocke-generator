/**
 * Compiler for search queries
 *
 * Converts an AST into a fast predicate function that matches Pokémon.
 */

import type { Pokemon } from "models";
import type {
    ASTNode,
    MatchPredicate,
    NormalizedPokemon,
    FieldFilterNode,
    BareTermNode,
    Comparator,
} from "./types";
import {
    ARRAY_FIELDS,
    BOOLEAN_FIELDS,
    NUMERIC_FIELDS,
    PREFIX_MATCH_FIELDS,
    VALID_FIELDS,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Main compile function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compile an AST into a predicate function.
 * Returns a function that always returns true if AST is null.
 */
export function compileQuery(ast: ASTNode | null): MatchPredicate {
    if (!ast) {
        return () => true;
    }

    return compileNode(ast);
}

// ─────────────────────────────────────────────────────────────────────────────
// Node compilers
// ─────────────────────────────────────────────────────────────────────────────

function compileNode(node: ASTNode): MatchPredicate {
    switch (node.type) {
        case "OR":
            return compileOr(node.children);
        case "AND":
            return compileAnd(node.children);
        case "NOT":
            return compileNot(node.child);
        case "FIELD_FILTER":
            return compileFieldFilter(node);
        case "BARE_TERM":
            return compileBareTerm(node);
    }
}

function compileOr(children: ASTNode[]): MatchPredicate {
    const predicates = children.map(compileNode);
    return (pokemon, normalized) =>
        predicates.some((p) => p(pokemon, normalized));
}

function compileAnd(children: ASTNode[]): MatchPredicate {
    const predicates = children.map(compileNode);
    return (pokemon, normalized) =>
        predicates.every((p) => p(pokemon, normalized));
}

function compileNot(child: ASTNode): MatchPredicate {
    const predicate = compileNode(child);
    return (pokemon, normalized) => !predicate(pokemon, normalized);
}

// ─────────────────────────────────────────────────────────────────────────────
// Bare term: matches species OR nickname prefix
// ─────────────────────────────────────────────────────────────────────────────

function compileBareTerm(node: BareTermNode): MatchPredicate {
    const { value, hasWildcard } = node;
    const lowerValue = value.toLowerCase();

    if (hasWildcard) {
        const regex = wildcardToRegex(lowerValue, true); // anchored to start
        return (_pokemon, normalized) =>
            regex.test(normalized.species) || regex.test(normalized.nickname);
    }

    // Simple prefix match
    return (_pokemon, normalized) =>
        normalized.species.startsWith(lowerValue) ||
        normalized.nickname.startsWith(lowerValue);
}

// ─────────────────────────────────────────────────────────────────────────────
// Field filter compilation
// ─────────────────────────────────────────────────────────────────────────────

function compileFieldFilter(node: FieldFilterNode): MatchPredicate {
    const { field, comparator, value, rangeEnd, hasWildcard } = node;

    // Unknown field - return always false
    if (!VALID_FIELDS.has(field)) {
        return () => false;
    }

    const lowerValue = value.toLowerCase();

    // Boolean fields
    if (BOOLEAN_FIELDS.has(field)) {
        const boolValue = parseBooleanValue(lowerValue);
        return (_pokemon, normalized) =>
            normalized[field as keyof NormalizedPokemon] === boolValue;
    }

    // Numeric fields
    if (NUMERIC_FIELDS.has(field)) {
        return compileNumericFilter(
            field as "level" | "metLevel",
            comparator,
            value,
            rangeEnd,
        );
    }

    // Array fields (types, moves)
    if (ARRAY_FIELDS.has(field)) {
        return compileArrayFilter(
            field as "types" | "moves",
            lowerValue,
            hasWildcard,
            comparator,
        );
    }

    // String fields (with various matching strategies)
    return compileStringFilter(field, lowerValue, hasWildcard, comparator);
}

// ─────────────────────────────────────────────────────────────────────────────
// Numeric filter
// ─────────────────────────────────────────────────────────────────────────────

function compileNumericFilter(
    field: "level" | "metLevel",
    comparator: Comparator,
    value: string,
    rangeEnd?: string,
): MatchPredicate {
    const num = parseFloat(value);

    // Range query
    if (rangeEnd !== undefined) {
        const endNum = parseFloat(rangeEnd);
        return (_pokemon, normalized) => {
            const fieldValue = normalized[field];
            return fieldValue >= num && fieldValue <= endNum;
        };
    }

    // Comparison
    switch (comparator) {
        case ":":
        case "=":
            return (_pokemon, normalized) => normalized[field] === num;
        case "!=":
            return (_pokemon, normalized) => normalized[field] !== num;
        case ">":
            return (_pokemon, normalized) => normalized[field] > num;
        case ">=":
            return (_pokemon, normalized) => normalized[field] >= num;
        case "<":
            return (_pokemon, normalized) => normalized[field] < num;
        case "<=":
            return (_pokemon, normalized) => normalized[field] <= num;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Array filter (types, moves)
// ─────────────────────────────────────────────────────────────────────────────

function compileArrayFilter(
    field: "types" | "moves",
    value: string,
    hasWildcard: boolean,
    comparator: Comparator,
): MatchPredicate {
    const isNegated = comparator === "!=";

    if (hasWildcard) {
        const regex = wildcardToRegex(value, false);
        const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
            normalized[field].some((v) => regex.test(v));
        return isNegated
            ? (p, n) => !matcher(p, n)
            : matcher;
    }

    // For moves, use substring matching; for types, use exact matching
    if (field === "moves") {
        const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
            normalized.moves.some((m) => m.includes(value));
        return isNegated ? (p, n) => !matcher(p, n) : matcher;
    }

    // types - exact match
    const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
        normalized.types.includes(value);
    return isNegated ? (p, n) => !matcher(p, n) : matcher;
}

// ─────────────────────────────────────────────────────────────────────────────
// String filter
// ─────────────────────────────────────────────────────────────────────────────

function compileStringFilter(
    field: string,
    value: string,
    hasWildcard: boolean,
    comparator: Comparator,
): MatchPredicate {
    const isNegated = comparator === "!=";
    const usePrefix = PREFIX_MATCH_FIELDS.has(field);

    // Get the field accessor
    const getFieldValue = (normalized: NormalizedPokemon): string => {
        return String(normalized[field as keyof NormalizedPokemon] ?? "");
    };

    if (hasWildcard) {
        const regex = wildcardToRegex(value, usePrefix);
        const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
            regex.test(getFieldValue(normalized));
        return isNegated ? (p, n) => !matcher(p, n) : matcher;
    }

    // Prefix match for species/nickname
    if (usePrefix) {
        const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
            getFieldValue(normalized).startsWith(value);
        return isNegated ? (p, n) => !matcher(p, n) : matcher;
    }

    // Substring match for other string fields
    const matcher = (_pokemon: Pokemon, normalized: NormalizedPokemon) =>
        getFieldValue(normalized).includes(value);
    return isNegated ? (p, n) => !matcher(p, n) : matcher;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a wildcard pattern to a RegExp.
 * - `*` matches any characters (including empty)
 * - `?` matches exactly one character
 */
function wildcardToRegex(pattern: string, anchorStart: boolean): RegExp {
    // Escape regex metacharacters except * and ?
    let escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");

    // Replace wildcards
    escaped = escaped.replace(/\*/g, ".*").replace(/\?/g, ".");

    // Anchor to start if specified (and pattern doesn't start with .*)
    const prefix = anchorStart && !escaped.startsWith(".*") ? "^" : "";

    return new RegExp(prefix + escaped, "i");
}

/**
 * Parse a boolean value from user input
 */
function parseBooleanValue(value: string): boolean {
    const lower = value.toLowerCase();
    return (
        lower === "true" ||
        lower === "yes" ||
        lower === "1" ||
        lower === "y"
    );
}

