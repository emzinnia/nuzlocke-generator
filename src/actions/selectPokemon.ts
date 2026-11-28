import { Action } from "./action";

export type SELECT_POKEMON = "SELECT_POKEMON";
export const SELECT_POKEMON: SELECT_POKEMON = "SELECT_POKEMON";

export type selectPokemon = (id: string) => Action<SELECT_POKEMON>;
export const selectPokemon = (id: string): Action<SELECT_POKEMON> => {
    return {
        type: SELECT_POKEMON,
        id,
    };
};
