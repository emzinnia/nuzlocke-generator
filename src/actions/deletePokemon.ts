import { Action } from "./action";

export type DELETE_POKEMON = "DELETE_POKEMON";
export const DELETE_POKEMON: DELETE_POKEMON = "DELETE_POKEMON";

export type deletePokemon = (id: string) => Action<DELETE_POKEMON>;
export const deletePokemon = (id: string): Action<DELETE_POKEMON> => {
    return {
        type: DELETE_POKEMON,
        id,
    };
};

export type CLEAR_BOX = "CLEAR_BOX";
export const CLEAR_BOX: CLEAR_BOX = "CLEAR_BOX";

export type clearBox = (name: string) => Action<CLEAR_BOX>;
export const clearBox = (name: string): Action<CLEAR_BOX> => {
    return {
        type: CLEAR_BOX,
        name,
    };
};
