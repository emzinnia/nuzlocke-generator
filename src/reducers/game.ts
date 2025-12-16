import { Action, EDIT_GAME, REPLACE_STATE, SYNC_STATE_FROM_HISTORY } from "../actions";
import { Game } from "models";

export function game(
    state: Game = {
        name: "None",
        customName: "",
    },
    action: Action<EDIT_GAME | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case EDIT_GAME:
            return { ...state, ...action.edit };
        case REPLACE_STATE:
            return action.replaceWith.game;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.game;
        default:
            return state;
    }
}
