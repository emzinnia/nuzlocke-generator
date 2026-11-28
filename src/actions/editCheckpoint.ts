import { Action } from "./action";
import { Badge } from "../models";

export type EDIT_CHECKPOINT = "EDIT_CHECKPOINT";
export const EDIT_CHECKPOINT: EDIT_CHECKPOINT = "EDIT_CHECKPOINT";

export interface EditCheckpointAction
    extends Action<EDIT_CHECKPOINT, Partial<Badge> | Badge["name"]> {
    edits: Partial<Badge>;
    name: Badge["name"];
}

export type editCheckpoint = (
    edits: Partial<Badge>,
    name: Badge["name"],
) => EditCheckpointAction;
export const editCheckpoint = (
    edits: Partial<Badge>,
    name: Badge["name"],
): EditCheckpointAction => {
    return {
        type: EDIT_CHECKPOINT,
        edits,
        name,
    };
};
