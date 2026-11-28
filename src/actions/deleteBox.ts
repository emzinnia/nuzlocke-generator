import { Action } from "./action";

export type DELETE_BOX = "DELETE_BOX";
export const DELETE_BOX: DELETE_BOX = "DELETE_BOX";

export type deleteBox = (k: number) => Action<DELETE_BOX>;
export function deleteBox(id: number): Action<DELETE_BOX> {
    return {
        type: DELETE_BOX,
        id,
    };
}
