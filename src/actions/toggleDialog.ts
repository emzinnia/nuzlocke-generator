import { Action } from "actions";
import { DialogViewType } from "models";

export type TOGGLE_DIALOG = "TOGGLE_DIALOG";
export const TOGGLE_DIALOG: TOGGLE_DIALOG = "TOGGLE_DIALOG";

export type toggleDialog = (
    dialogTarget: DialogViewType,
) => Action<TOGGLE_DIALOG>;
export const toggleDialog = (
    dialogTarget: DialogViewType,
): Action<TOGGLE_DIALOG> => {
    return {
        type: TOGGLE_DIALOG,
        dialog: dialogTarget,
    };
};
