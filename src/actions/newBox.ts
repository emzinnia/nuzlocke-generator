import { Action } from "./action";

export type NEW_BOX = "NEW_BOX";
export const NEW_BOX: NEW_BOX = "NEW_BOX";

export type newBox = (n: string) => Action<NEW_BOX>;
export function newBox(name: string): Action<NEW_BOX> {
    return {
        type: NEW_BOX,
        name,
    };
}
