import { Action } from "./action";
import { Box } from "models";

export type EDIT_BOX = "EDIT_BOX";
export const EDIT_BOX: EDIT_BOX = "EDIT_BOX";

export type editBox = (id: number, edits: Partial<Box>) => Action<EDIT_BOX>;
export function editBox(id: number, edits: Partial<Box>): Action<EDIT_BOX> {
    return {
        type: EDIT_BOX,
        id,
        edits,
    };
}
