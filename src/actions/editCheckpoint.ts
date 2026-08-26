import { Action } from "./action";
import { Badge } from "../models";

export type EDIT_CHECKPOINT = "EDIT_CHECKPOINT";
export const EDIT_CHECKPOINT: EDIT_CHECKPOINT = "EDIT_CHECKPOINT";

export interface EditCheckpointAction
    extends Action<
        EDIT_CHECKPOINT,
        Partial<Badge> | Badge["name"] | number | undefined
    > {
    edits: Partial<Badge>;
    name: Badge["name"];
    index?: number;
}

export type editCheckpoint = (
    edits: Partial<Badge>,
    name: Badge["name"],
    index?: number,
) => EditCheckpointAction;
export const editCheckpoint = (
    edits: Partial<Badge>,
    name: Badge["name"],
    index?: number,
): EditCheckpointAction => {
    return {
        type: EDIT_CHECKPOINT,
        edits,
        name,
        index,
    };
};
