import { Action } from "./action";

export type EDIT_CUSTOM_MOVE_MAP = "EDIT_CUSTOM_MOVE_MAP";
export const EDIT_CUSTOM_MOVE_MAP: EDIT_CUSTOM_MOVE_MAP =
    "EDIT_CUSTOM_MOVE_MAP";

export type editCustomMoveMap = (
    moveType,
    moveName,
) => Action<EDIT_CUSTOM_MOVE_MAP>;
export const editCustomMoveMap = (
    moveType,
    moveName,
): Action<EDIT_CUSTOM_MOVE_MAP> => {
    return {
        type: EDIT_CUSTOM_MOVE_MAP,
        moveType,
        moveName,
    };
};

export type DELETE_CUSTOM_MOVE = "DELETE_CUSTOM_MOVE";
export const DELETE_CUSTOM_MOVE: DELETE_CUSTOM_MOVE = "DELETE_CUSTOM_MOVE";

export type deleteCustomMove = (id: string) => Action<DELETE_CUSTOM_MOVE>;
export const deleteCustomMove = (id) => ({ type: DELETE_CUSTOM_MOVE, id });
