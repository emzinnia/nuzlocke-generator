import { Action } from "actions";

export type UPDATE_EXCLUDED_AREAS = "UPDATE_EXCLUDED_AREAS";
export const UPDATE_EXCLUDED_AREAS: UPDATE_EXCLUDED_AREAS =
    "UPDATE_EXCLUDED_AREAS";

export type updateExcludedAreas = (
    excludedAreas: string[],
) => Action<UPDATE_EXCLUDED_AREAS>;
export const updateExcludedAreas = (
    excludedAreas: string[],
): Action<UPDATE_EXCLUDED_AREAS> => {
    return {
        type: UPDATE_EXCLUDED_AREAS,
        excludedAreas,
    };
};
