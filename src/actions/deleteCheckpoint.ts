import { Action } from "./action";
import { Badge } from "../models";

export type DELETE_CHECKPOINT = "DELETE_CHECKPOINT";
export const DELETE_CHECKPOINT: DELETE_CHECKPOINT = "DELETE_CHECKPOINT";

export interface DeleteCheckpointAction
    extends Action<DELETE_CHECKPOINT, Badge["name"]> {
    name: Badge["name"];
}

export type deleteCheckpoint = (
    name: Badge["name"],
) => DeleteCheckpointAction;
export const deleteCheckpoint = (
    name: Badge["name"],
): DeleteCheckpointAction => {
    return {
        type: DELETE_CHECKPOINT,
        name,
    };
};
