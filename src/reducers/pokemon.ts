import {
    Action,
    ADD_POKEMON,
    DELETE_POKEMON,
    EDIT_POKEMON,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    CLEAR_BOX,
} from "../actions";
// Import directly to avoid circular dependency through utils barrel
import { generateEmptyPokemon } from "utils/generateEmptyPokemon";

// Lazy-initialize default state to avoid circular dependency issues
// The state will be initialized on first reducer call
let pokemonState: ReturnType<typeof generateEmptyPokemon>[] | null = null;
function getDefaultPokemonState() {
    if (pokemonState === null) {
        pokemonState = [];
    }
    return pokemonState;
}

export function pokemon(
    state = getDefaultPokemonState(),
    action:
        | Action<ADD_POKEMON>
        | Action<DELETE_POKEMON>
        | Action<EDIT_POKEMON | REPLACE_STATE | SYNC_STATE_FROM_HISTORY | CLEAR_BOX>,
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
        case REPLACE_STATE:
            return action.replaceWith.pokemon;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith?.pokemon ?? state;
        default:
            return state;
    }
}
