import { Action } from "actions";

export type REPLACE_STATE = "REPLACE_STATE";
export const REPLACE_STATE: REPLACE_STATE = "REPLACE_STATE";

export type replaceState = (replaceWith: unknown) => Action<REPLACE_STATE, unknown>;
export function replaceState(replaceWith: unknown): Action<REPLACE_STATE, unknown> {
    return {
        type: REPLACE_STATE,
        replaceWith,
    };
}
