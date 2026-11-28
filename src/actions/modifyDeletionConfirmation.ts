import { Action } from "./action";

export type MODIFY_DELETION_CONFIRMATION = "MODIFY_DELETION_CONFIRMATION";
export const MODIFY_DELETION_CONFIRMATION: MODIFY_DELETION_CONFIRMATION =
    "MODIFY_DELETION_CONFIRMATION";

export type modifyDeletionConfirmation = (
    n: boolean,
) => Action<MODIFY_DELETION_CONFIRMATION>;
export const modifyDeletionConfirmation = (
    newStatus: boolean,
): Action<MODIFY_DELETION_CONFIRMATION> => {
    return {
        type: MODIFY_DELETION_CONFIRMATION,
        newStatus,
    };
};
