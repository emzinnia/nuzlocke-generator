import { Action } from "actions";

export type UPDATE_CUSTOM_AREAS = "UPDATE_CUSTOM_AREAS";
export const UPDATE_CUSTOM_AREAS: UPDATE_CUSTOM_AREAS = "UPDATE_CUSTOM_AREAS";

export type updateCustomAreas = (
    areas: string[],
) => Action<UPDATE_CUSTOM_AREAS>;
export const updateCustomAreas = (
    areas: string[],
): Action<UPDATE_CUSTOM_AREAS> => {
    return {
        type: UPDATE_CUSTOM_AREAS,
        areas,
    };
};
