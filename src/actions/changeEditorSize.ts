import { Action } from "./action";

export type CHANGE_EDITOR_SIZE = "CHANGE_EDITOR_SIZE";
export const CHANGE_EDITOR_SIZE: CHANGE_EDITOR_SIZE = "CHANGE_EDITOR_SIZE";

export type changeEditorSize = (
    mode: boolean,
) => Action<CHANGE_EDITOR_SIZE, boolean>;
export const changeEditorSize = (
    mode: boolean,
): Action<CHANGE_EDITOR_SIZE, boolean> => {
    return {
        type: CHANGE_EDITOR_SIZE,
        mode,
    };
};
