import { Action } from "./action";
import { Game } from "utils";

export type EDIT_GAME = "EDIT_GAME";
export const EDIT_GAME: EDIT_GAME = "EDIT_GAME";

export interface GameType {
    name?: Game;
}

export type editGame = (e: object) => Action<EDIT_GAME>;
export function editGame(edit: object): Action<EDIT_GAME> {
    return {
        type: EDIT_GAME,
        edit,
    };
}
