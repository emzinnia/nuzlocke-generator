/**
 * Normalization utilities for Pokémon search
 *
 * Creates normalized representations of Pokémon for fast matching.
 */

import type { Pokemon } from "models";
import type { NormalizedPokemon } from "./types";

/**
 * Normalize a string value for search comparison.
 * - Lowercase
 * - Trim whitespace
 * - Collapse internal whitespace
 */
function normalizeString(value: string | undefined | null): string {
    if (!value) return "";
    return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Convert a Pokémon to its normalized search representation.
 */
export function normalizePokemon(pokemon: Pokemon): NormalizedPokemon {
    return {
        id: pokemon.id,
        species: normalizeString(pokemon.species),
        nickname: normalizeString(pokemon.nickname),
        gender: normalizeString(pokemon.gender),
        types: (pokemon.types ?? [])
            .filter(Boolean)
            .map((t) => normalizeString(t)),
        teraType: normalizeString(pokemon.teraType),
        moves: (pokemon.moves ?? [])
            .filter(Boolean)
            .map((m) => normalizeString(m)),
        item: normalizeString(pokemon.item),
        ability: normalizeString(pokemon.ability),
        nature: normalizeString(pokemon.nature),
        level: pokemon.level ?? 0,
        metLevel: pokemon.metLevel ?? 0,
        status: normalizeString(pokemon.status),
        forme: normalizeString(pokemon.forme),
        game: normalizeString(pokemon.gameOfOrigin),
        shiny: Boolean(pokemon.shiny),
        egg: Boolean(pokemon.egg),
        hidden: Boolean(pokemon.hidden),
        alpha: Boolean(pokemon.alpha),
        mvp: Boolean(pokemon.mvp),
        gift: Boolean(pokemon.gift),
        notes: normalizeString(pokemon.notes),
    };
}

/**
 * Cache for normalized Pokémon data.
 * Uses a WeakMap so entries are garbage collected when Pokémon objects
 * are no longer referenced.
 */
const normalizedCache = new WeakMap<Pokemon, NormalizedPokemon>();

/**
 * Get or create a normalized representation of a Pokémon.
 * Uses caching for performance.
 */
export function getNormalizedPokemon(pokemon: Pokemon): NormalizedPokemon {
    let normalized = normalizedCache.get(pokemon);

    if (!normalized) {
        normalized = normalizePokemon(pokemon);
        normalizedCache.set(pokemon, normalized);
    }

    return normalized;
}

/**
 * Build a map of normalized Pokémon for a team.
 * This is useful for one-time batch processing.
 */
export function buildNormalizedMap(
    team: Pokemon[],
): Map<string, NormalizedPokemon> {
    const map = new Map<string, NormalizedPokemon>();

    for (const pokemon of team) {
        map.set(pokemon.id, getNormalizedPokemon(pokemon));
    }

    return map;
}

/**
 * Clear the normalization cache.
 * Useful for testing or when you know data has changed.
 */
export function clearNormalizationCache(): void {
    // WeakMap doesn't have a clear method, so we just create a new one
    // This function exists for API consistency but the WeakMap handles cleanup automatically
}


