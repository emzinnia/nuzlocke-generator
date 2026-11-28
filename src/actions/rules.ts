import { Action } from "actions";

export type ADD_RULE = "ADD_RULE";
export const ADD_RULE: ADD_RULE = "ADD_RULE";

export type addRule = () => Action<ADD_RULE>;
export function addRule() {
    return {
        type: ADD_RULE,
    };
}

export type EDIT_RULE = "EDIT_RULE";
export const EDIT_RULE: EDIT_RULE = "EDIT_RULE";

export type editRule = (target: number, rule: string) => Action<EDIT_RULE>;
export function editRule(target, rule) {
    return {
        type: EDIT_RULE,
        target,
        rule,
    };
}

export type DELETE_RULE = "DELETE_RULE";
export const DELETE_RULE: DELETE_RULE = "DELETE_RULE";

export type deleteRule = (target: number) => Action<DELETE_RULE>;
export function deleteRule(target) {
    return {
        type: DELETE_RULE,
        target,
    };
}

export type RESET_RULES = "RESET_RULES";
export const RESET_RULES: RESET_RULES = "RESET_RULES";

export type resetRules = () => Action<RESET_RULES>;
export function resetRules() {
    return {
        type: RESET_RULES,
    };
}

export type SET_RULES = "SET_RULES";
export const SET_RULES: SET_RULES = "SET_RULES";

export type setRules = (rules: string[]) => Action<SET_RULES>;
export function setRules(rules: string[]) {
    return {
        type: SET_RULES,
        rules,
    };
}
