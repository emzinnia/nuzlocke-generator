import { Action } from "./action";

export type SET_BASE_EDITOR_STATE = "SET_BASE_EDITOR_STATE";
export const SET_BASE_EDITOR_STATE: SET_BASE_EDITOR_STATE =
    "SET_BASE_EDITOR_STATE";

export type setBaseEditorState = (
    editorId: string,
    isOpen: boolean,
) => Action<SET_BASE_EDITOR_STATE, { editorId: string; isOpen: boolean }>;

export const setBaseEditorState: setBaseEditorState = (
    editorId: string,
    isOpen: boolean,
) => {
    return {
        type: SET_BASE_EDITOR_STATE,
        editorId,
        isOpen,
    };
};

