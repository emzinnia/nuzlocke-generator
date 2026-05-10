import {
    Action,
    ADD_CUSTOM_CHECKPOINT,
    DELETE_CHECKPOINT,
    EDIT_CHECKPOINT,
    REORDER_CHECKPOINTS,
    RESET_CHECKPOINTS,
    addCustomCheckpoint,
    editCheckpoint,
    deleteCheckpoint,
    reorderCheckpoints,
    resetCheckpoints,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    replaceState,
    syncStateFromHistory,
} from "actions";
import { Badge } from "models";
import { getBadges, Game } from "utils";

export type Checkpoints = Badge[];

export function checkpoints(
    state: Checkpoints = getBadges("None"),
    action: ReturnType<
        | addCustomCheckpoint
        | editCheckpoint
        | deleteCheckpoint
        | resetCheckpoints
        | reorderCheckpoints
        | replaceState
        | syncStateFromHistory
    >,
) {
    switch (action.type) {
        case RESET_CHECKPOINTS:
            return getBadges(action.game as Game);
        case REORDER_CHECKPOINTS:
            // return arrayMove(state, action.oldIndex as number, action.newIndex as number);
            return state;
        case ADD_CUSTOM_CHECKPOINT:
            return [...state, action.checkpoint];
        case REPLACE_STATE:
            return action.replaceWith.checkpoints ?? state;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.checkpoints ?? state;
        case EDIT_CHECKPOINT: {
            const checkpointIndex = state
                .map((n) => n.name)
                .indexOf(action.name);
            const checkpoint = state[checkpointIndex];
            if (checkpointIndex < 0 || !checkpoint) {
                return state;
            }

            const newState = state.slice();
            newState.splice(
                checkpointIndex,
                1,
                {
                    ...checkpoint,
                    ...action.edits,
                },
            );
            return newState;
        }
        case DELETE_CHECKPOINT:
            return state.filter((c) => c.name !== action.name);
        default:
            return state;
    }
}
