import { Action } from "actions";

export type ADD_STAT = "ADD_STAT";
export const ADD_STAT: ADD_STAT = "ADD_STAT";

export type addStat = (stat: {
    key: string;
    value: string;
}) => Action<ADD_STAT>;
export function addStat(stat) {
    return {
        type: ADD_STAT,
        stat,
    };
}

export type EDIT_STAT = "EDIT_STAT";
export const EDIT_STAT: EDIT_STAT = "EDIT_STAT";

export type editStat = (
    id: string,
    key: string,
    value: string,
) => Action<EDIT_STAT>;
export function editStat(id, key, value) {
    return {
        type: EDIT_STAT,
        id,
        key,
        value,
    };
}

export type DELETE_STAT = "DELETE_STAT";
export const DELETE_STAT: DELETE_STAT = "DELETE_STAT";

export type deleteStat = (id: string) => Action<DELETE_STAT>;
export function deleteStat(id) {
    return {
        type: DELETE_STAT,
        id,
    };
}
