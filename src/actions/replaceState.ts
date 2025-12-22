import { Action } from "actions";

export type REPLACE_STATE = "REPLACE_STATE";
export const REPLACE_STATE: REPLACE_STATE = "REPLACE_STATE";

export type replaceState = (replaceWith: any) => Action<REPLACE_STATE>;
export function replaceState(replaceWith: any) {
    return {
        type: REPLACE_STATE,
        replaceWith,
    };
}
