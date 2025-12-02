/**
 * Run API functions for CRUD operations.
 */

import { api } from './client';
import type { State } from '../state';

export interface RunSummary {
  id: string;
  name: string;
  revision: number;
  updated_at: string;
  inserted_at: string;
}

export interface Run extends RunSummary {
  data: Partial<State>;
}

export interface RunsListResponse {
  runs: RunSummary[];
}

export interface RunResponse {
  run: Run;
}

export interface PatchResponse {
  run: {
    id: string;
    revision: number;
  };
}

/**
 * List all runs for the current user.
 */
export async function listRuns(): Promise<RunSummary[]> {
  const response = await api.get<RunsListResponse>('/api/runs');
  return response.runs;
}

/**
 * Get a specific run by ID.
 */
export async function getRun(id: string): Promise<Run> {
  const response = await api.get<RunResponse>(`/api/runs/${id}`);
  return response.run;
}

/**
 * Create a new run.
 */
export async function createRun(
  name?: string,
  data?: Partial<State>
): Promise<Run> {
  const response = await api.post<RunResponse>('/api/runs', { name, data });
  return response.run;
}

/**
 * Update a run.
 */
export async function updateRun(
  id: string,
  updates: { name?: string; data?: Partial<State> }
): Promise<Run> {
  const response = await api.put<RunResponse>(`/api/runs/${id}`, updates);
  return response.run;
}

/**
 * Apply a patch to a run's data.
 */
export async function patchRun(
  id: string,
  patch: Partial<State>
): Promise<{ id: string; revision: number }> {
  const response = await api.post<PatchResponse>(`/api/runs/${id}/patch`, { patch });
  return response.run;
}

/**
 * Delete a run.
 */
export async function deleteRun(id: string): Promise<void> {
  await api.delete(`/api/runs/${id}`);
}

/**
 * Pokemon data for adding to a run.
 */
export interface NewPokemon {
  nickname: string;
  species: string;
  level?: number;
  met?: string;
  metLevel?: number;
  gender?: 'Male' | 'Female' | 'Neutral';
  nature?: string;
  ability?: string;
  moves?: string[];
  types?: string[];
}

/**
 * Add a Pokemon to a run.
 * Fetches current run data, appends the new pokemon, and patches the run.
 */
export async function addPokemonToRun(
  runId: string,
  pokemon: NewPokemon
): Promise<{ id: string; revision: number }> {
  // Fetch current run to get existing pokemon
  const run = await getRun(runId);
  const currentPokemon = run.data.pokemon || [];

  // Create new pokemon with a unique ID
  const newPokemon = {
    id: crypto.randomUUID(),
    nickname: pokemon.nickname,
    species: pokemon.species,
    level: pokemon.level,
    met: pokemon.met,
    metLevel: pokemon.metLevel,
    gender: pokemon.gender,
    nature: pokemon.nature,
    ability: pokemon.ability,
    moves: pokemon.moves,
    types: pokemon.types,
  };

  // Patch the run with the updated pokemon array
  return patchRun(runId, {
    pokemon: [...currentPokemon, newPokemon],
  });
}

