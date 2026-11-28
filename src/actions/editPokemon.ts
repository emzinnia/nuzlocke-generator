import { Action } from "./action";

export type EDIT_POKEMON = "EDIT_POKEMON";
export const EDIT_POKEMON: EDIT_POKEMON = "EDIT_POKEMON";

export type editPokemon = (edits: object, id: string) => Action<EDIT_POKEMON>;
export function editPokemon(edits: object, id: string): Action<EDIT_POKEMON> {
    return {
        type: EDIT_POKEMON,
        edits,
        id,
    };
}
