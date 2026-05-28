import { Action } from "./action";
import { Badge } from "../models";

export type DELETE_CHECKPOINT = "DELETE_CHECKPOINT";
export const DELETE_CHECKPOINT: DELETE_CHECKPOINT = "DELETE_CHECKPOINT";

export interface DeleteCheckpointAction
    extends Action<DELETE_CHECKPOINT, Badge["name"] | number | undefined> {
    name: Badge["name"];
    index?: number;
}

export type deleteCheckpoint = (
    name: Badge["name"],
    index?: number,
) => DeleteCheckpointAction;
export const deleteCheckpoint = (
    name: Badge["name"],
    index?: number,
): DeleteCheckpointAction => {
    return {
        type: DELETE_CHECKPOINT,
        name,
        index,
    };
};
