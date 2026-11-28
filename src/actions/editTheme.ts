import { Action } from "./action";

export type EDIT_THEME = "EDIT_THEME";
export const EDIT_THEME: EDIT_THEME = "EDIT_THEME";

export type editTheme = (e: object) => Action<EDIT_THEME>;
export function editTheme(edits: object): Action<EDIT_THEME> {
    return {
        type: EDIT_THEME,
        edits,
    };
}
