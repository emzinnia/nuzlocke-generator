import { Action } from "./action";
import { Badge } from "../models";

export type REORDER_CHECKPOINTS = "REORDER_CHECKPOINTS";
export const REORDER_CHECKPOINTS: REORDER_CHECKPOINTS = "REORDER_CHECKPOINTS";

export interface ReorderCheckpointsAction
    extends Action<REORDER_CHECKPOINTS, number> {
    oldIndex: number;
    newIndex: number;
}

export type reorderCheckpoints = (
    oldIndex: number,
    newIndex: number,
) => ReorderCheckpointsAction;
export const reorderCheckpoints = (
    oldIndex: number,
    newIndex: number,
): ReorderCheckpointsAction => {
    return {
        type: REORDER_CHECKPOINTS,
        oldIndex,
        newIndex,
    };
};
