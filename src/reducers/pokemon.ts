import {
    Action,
    ADD_POKEMON,
    DELETE_CHECKPOINT,
    DELETE_POKEMON,
    EDIT_CHECKPOINT,
    EDIT_POKEMON,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    CLEAR_BOX,
} from "../actions";
import { Pokemon } from "models";
import { generateEmptyPokemon } from "utils";

const pokemonState = [generateEmptyPokemon()];

const syncPokemonCheckpointsOnEdit = (
    state: Pokemon[],
    name: string,
    edits: { name?: string; image?: string },
): Pokemon[] => {
    let changed = false;
    const next = state.map((poke) => {
        if (!Array.isArray(poke.checkpoints)) {
            return poke;
        }
        let pokeChanged = false;
        const checkpoints = poke.checkpoints.map((badge) => {
            if (badge.name !== name) {
                return badge;
            }
            pokeChanged = true;
            return { ...badge, ...edits };
        });
        if (!pokeChanged) {
            return poke;
        }
        changed = true;
        return { ...poke, checkpoints };
    });
    return changed ? next : state;
};

const syncPokemonCheckpointsOnDelete = (
    state: Pokemon[],
    name: string,
): Pokemon[] => {
    let changed = false;
    const next = state.map((poke) => {
        if (!Array.isArray(poke.checkpoints)) {
            return poke;
        }
        const checkpoints = poke.checkpoints.filter(
            (badge) => badge.name !== name,
        );
        if (checkpoints.length === poke.checkpoints.length) {
            return poke;
        }
        changed = true;
        return { ...poke, checkpoints };
    });
    return changed ? next : state;
};

export function pokemon(
    state = pokemonState,
    action:
        | Action<ADD_POKEMON>
        | Action<DELETE_POKEMON>
        | Action<
              | EDIT_POKEMON
              | EDIT_CHECKPOINT
              | DELETE_CHECKPOINT
              | REPLACE_STATE
              | SYNC_STATE_FROM_HISTORY
              | CLEAR_BOX
          >,
) {
    switch (action.type) {
        case ADD_POKEMON:
            return [...state, action.pokemon];
        case DELETE_POKEMON:
            return state.filter((val, index) => {
                return val.id !== action.id;
            });
        case CLEAR_BOX:
            return state.filter((val, index) => {
                return val.status !== action.name;
            });
        case EDIT_POKEMON: {
            const pokemonToEdit = state.find((poke) => poke.id === action.id);
            const deathTimestamp =
                action.edits &&
                pokemonToEdit &&
                pokemonToEdit.status !== "Dead" &&
                action.edits.status === "Dead"
                    ? { deathTimestamp: Date.now() }
                    : {};
            const newPoke = {
                ...pokemonToEdit,
                ...action.edits,
                ...deathTimestamp,
            };
            if (state.length === 1) {
                return [newPoke];
            }
            return [...state.filter((poke) => poke.id !== action.id), newPoke];
        }
        case EDIT_CHECKPOINT:
            return syncPokemonCheckpointsOnEdit(
                state,
                action.name,
                action.edits,
            );
        case DELETE_CHECKPOINT:
            return syncPokemonCheckpointsOnDelete(state, action.name);
        case REPLACE_STATE:
            return action.replaceWith.pokemon;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith?.pokemon ?? state;
        default:
            return state;
    }
}
