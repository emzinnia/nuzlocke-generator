import { Action } from "./action";
import { Badge } from "../models";

export type ADD_CUSTOM_CHECKPOINT = "ADD_CUSTOM_CHECKPOINT";
export const ADD_CUSTOM_CHECKPOINT: ADD_CUSTOM_CHECKPOINT =
    "ADD_CUSTOM_CHECKPOINT";

export interface AddCustomCheckpointAction
    extends Action<ADD_CUSTOM_CHECKPOINT, Badge> {
    checkpoint: Badge;
}

export type addCustomCheckpoint = (
    checkpoint: Badge,
) => AddCustomCheckpointAction;
export const addCustomCheckpoint = (
    checkpoint: Badge,
): AddCustomCheckpointAction => {
    return {
        type: ADD_CUSTOM_CHECKPOINT,
        checkpoint,
    };
};
