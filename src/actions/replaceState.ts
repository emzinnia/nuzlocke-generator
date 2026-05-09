import { Action } from "actions";
import { State } from "state";

export type REPLACE_STATE = "REPLACE_STATE";
export const REPLACE_STATE: REPLACE_STATE = "REPLACE_STATE";

export interface ReplaceStateAction
    extends Action<REPLACE_STATE, Partial<State>> {
    replaceWith: Partial<State>;
}

export type replaceState = (
    replaceWith: Partial<State>,
) => ReplaceStateAction;
export function replaceState(replaceWith: Partial<State>): ReplaceStateAction {
    return {
        type: REPLACE_STATE,
        replaceWith,
    };
}
