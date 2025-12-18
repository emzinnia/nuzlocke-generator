/**
 * Search Engine
 *
 * Advanced, performant search for Pokémon.
 *
 * Usage:
 * ```ts
 * import { searchPokemon, parseQuery, compileQuery } from 'utils/search';
 *
 * // Simple: get matching IDs directly
 * const matchedIds = searchPokemon(team, "Br");
 * const matchedIds = searchPokemon(team, "type:dark gender:f");
 *
 * // Advanced: parse and compile separately for reuse
 * const { ast, errors, warnings } = parseQuery("type:dark | type:ghost");
 * const predicate = compileQuery(ast);
 * const matches = team.filter(p => predicate(p, getNormalizedPokemon(p)));
 * ```
 */

import type { Pokemon } from "models";
import type { MatchPredicate, ParseResult } from "./types";
import { parseQuery } from "./parse";
import { compileQuery } from "./compile";
import { getNormalizedPokemon } from "./normalize";

// Re-export everything
export * from "./types";
export { parseQuery } from "./parse";
export { compileQuery } from "./compile";
export { tokenize } from "./tokenize";
export {
    normalizePokemon,
    getNormalizedPokemon,
    buildNormalizedMap,
} from "./normalize";

// ─────────────────────────────────────────────────────────────────────────────
// High-level search API
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResult {
    /** Set of matching Pokémon IDs */
    matchedIds: Set<string>;
    /** Parse errors (if any) */
    errors: ParseResult["errors"];
    /** Parse warnings (if any) */
    warnings: ParseResult["warnings"];
}

/**
 * Search a team of Pokémon with a query string.
 *
 * Returns a Set of matching Pokémon IDs plus any parse errors/warnings.
 *
 * @example
 * ```ts
 * const { matchedIds } = searchPokemon(team, "Br");
 * // matchedIds contains IDs of Pokémon whose species/nickname starts with "Br"
 *
 * const { matchedIds } = searchPokemon(team, "type:dark !status:Dead");
 * // matchedIds contains Dark-type Pokémon that are not in the Dead box
 * ```
 */
export function searchPokemon(team: Pokemon[], query: string): SearchResult {
    // Empty query matches everything
    if (!query.trim()) {
        return {
            matchedIds: new Set(team.map((p) => p.id)),
            errors: [],
            warnings: [],
        };
    }

    // Parse and compile
    const { ast, errors, warnings } = parseQuery(query);
    const predicate = compileQuery(ast);

    // If there are errors, fall back to simple prefix search
    // This prevents "everything disappearing" on typos
    const effectivePredicate: MatchPredicate =
        errors.length > 0
            ? createFallbackPredicate(query)
            : predicate;

    // Evaluate against all Pokémon
    const matchedIds = new Set<string>();

    for (const pokemon of team) {
        const normalized = getNormalizedPokemon(pokemon);
        if (effectivePredicate(pokemon, normalized)) {
            matchedIds.add(pokemon.id);
        }
    }

    return { matchedIds, errors, warnings };
}

/**
 * Create a simple fallback predicate for when parsing fails.
 * Just does prefix matching on species/nickname.
 */
function createFallbackPredicate(query: string): MatchPredicate {
    const lowerQuery = query.toLowerCase().trim();

    return (_pokemon, normalized) =>
        normalized.species.startsWith(lowerQuery) ||
        normalized.nickname.startsWith(lowerQuery);
}

// ─────────────────────────────────────────────────────────────────────────────
// Cached/memoized search for React components
// ─────────────────────────────────────────────────────────────────────────────

let cachedQuery = "";
let cachedTeamIds = "";
let cachedResult: SearchResult | null = null;

/**
 * Memoized search that caches results.
 * Only recomputes if query or team changes.
 *
 * Note: Team identity is checked by comparing stringified IDs,
 * which is a cheap approximation. For strict correctness,
 * you may want to invalidate on any team change.
 */
export function searchPokemonMemoized(
    team: Pokemon[],
    query: string,
): SearchResult {
    const teamIds = team.map((p) => p.id).join(",");

    if (query === cachedQuery && teamIds === cachedTeamIds && cachedResult) {
        return cachedResult;
    }

    cachedQuery = query;
    cachedTeamIds = teamIds;
    cachedResult = searchPokemon(team, query);

    return cachedResult;
}

/**
 * Clear the search cache.
 * Call this when team data changes in a way that the ID check wouldn't catch.
 */
export function clearSearchCache(): void {
    cachedQuery = "";
    cachedTeamIds = "";
    cachedResult = null;
}

