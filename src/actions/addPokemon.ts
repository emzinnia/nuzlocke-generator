import { Action } from "./action";
import { Pokemon } from "../models";

export type ADD_POKEMON = "ADD_POKEMON";
export const ADD_POKEMON: ADD_POKEMON = "ADD_POKEMON";

export type addPokemon = (p: Pokemon) => Action<ADD_POKEMON, Pokemon>;
export const addPokemon = (pokemon: Pokemon): Action<ADD_POKEMON, Pokemon> => {
    return {
        type: ADD_POKEMON,
        pokemon,
    };
};
