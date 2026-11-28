import { Action } from "./action";
import { Styles } from "utils";

export type EDIT_STYLE = "EDIT_STYLE";
export const EDIT_STYLE: EDIT_STYLE = "EDIT_STYLE";

export type editStyle = (e: Partial<Styles>) => Action<EDIT_STYLE>;
export function editStyle(edits: Partial<Styles>): Action<EDIT_STYLE> {
    return {
        type: EDIT_STYLE,
        edits,
    };
}
