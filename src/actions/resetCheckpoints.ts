import { Action } from "./action";
import { Game } from "utils";

export type RESET_CHECKPOINTS = "RESET_CHECKPOINTS";
export const RESET_CHECKPOINTS: RESET_CHECKPOINTS = "RESET_CHECKPOINTS";

export interface ResetCheckpointsAction
    extends Action<RESET_CHECKPOINTS, Game> {
    game: Game;
}

export type resetCheckpoints = (game: Game) => ResetCheckpointsAction;
export const resetCheckpoints = (
    game: Game,
): ResetCheckpointsAction => {
    return {
        type: RESET_CHECKPOINTS,
        game,
    };
};
