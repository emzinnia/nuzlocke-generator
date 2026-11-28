import { Action } from "actions";

export type NEW_NUZLOCKE = "NEW_NUZLOCKE";
export const NEW_NUZLOCKE: NEW_NUZLOCKE = "NEW_NUZLOCKE";

export type newNuzlocke = (data, { isCopy }) => Action<NEW_NUZLOCKE>;
export function newNuzlocke(data, { isCopy }): Action<NEW_NUZLOCKE> {
    return {
        type: NEW_NUZLOCKE,
        data,
        isCopy,
    };
}

export type DELETE_NUZLOCKE = "DELETE_NUZLOCKE";
export const DELETE_NUZLOCKE: DELETE_NUZLOCKE = "DELETE_NUZLOCKE";

export type deleteNuzlocke = (id: string) => Action<DELETE_NUZLOCKE>;
export function deleteNuzlocke(id: string): Action<DELETE_NUZLOCKE> {
    return {
        type: DELETE_NUZLOCKE,
        id,
    };
}

export type SWITCH_NUZLOCKE = "SWITCH_NUZLOCKE";
export const SWITCH_NUZLOCKE: SWITCH_NUZLOCKE = "SWITCH_NUZLOCKE";

export type switchNuzlocke = (id: string) => Action<SWITCH_NUZLOCKE>;
export function switchNuzlocke(id: string): Action<SWITCH_NUZLOCKE> {
    return {
        type: SWITCH_NUZLOCKE,
        id,
    };
}

export type UPDATE_NUZLOCKE = "UPDATE_NUZLOCKE";
export const UPDATE_NUZLOCKE: UPDATE_NUZLOCKE = "UPDATE_NUZLOCKE";

export type updateNuzlocke = (id: string, data) => Action<UPDATE_NUZLOCKE>;
export function updateNuzlocke(id: string, data): Action<UPDATE_NUZLOCKE> {
    return {
        type: UPDATE_NUZLOCKE,
        id,
        data,
    };
}

export type UPDATE_SWITCH_NUZLOCKE = "UPDATE_SWITCH_NUZLOCKE";
export const UPDATE_SWITCH_NUZLOCKE: UPDATE_SWITCH_NUZLOCKE =
    "UPDATE_SWITCH_NUZLOCKE";

export type updateSwitchNuzlocke = (
    id: string,
    newId: string,
    data,
) => Action<UPDATE_SWITCH_NUZLOCKE>;
export function updateSwitchNuzlocke(
    id: string,
    newId: string,
    data,
): Action<UPDATE_SWITCH_NUZLOCKE> {
    return {
        type: UPDATE_SWITCH_NUZLOCKE,
        id,
        newId,
        data,
    };
}
