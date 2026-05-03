import { Action } from "actions";

export type UPDATE_COMPLETED_ROUTES = "UPDATE_COMPLETED_ROUTES";
export const UPDATE_COMPLETED_ROUTES: UPDATE_COMPLETED_ROUTES =
    "UPDATE_COMPLETED_ROUTES";

export type UPDATE_SKIPPED_ROUTES = "UPDATE_SKIPPED_ROUTES";
export const UPDATE_SKIPPED_ROUTES: UPDATE_SKIPPED_ROUTES =
    "UPDATE_SKIPPED_ROUTES";

export type updateCompletedRoutes = (
    completedRoutes: string[],
) => Action<UPDATE_COMPLETED_ROUTES>;
export const updateCompletedRoutes = (
    completedRoutes: string[],
): Action<UPDATE_COMPLETED_ROUTES> => {
    return {
        type: UPDATE_COMPLETED_ROUTES,
        completedRoutes,
    };
};

export type updateSkippedRoutes = (
    skippedRoutes: string[],
) => Action<UPDATE_SKIPPED_ROUTES>;
export const updateSkippedRoutes = (
    skippedRoutes: string[],
): Action<UPDATE_SKIPPED_ROUTES> => {
    return {
        type: UPDATE_SKIPPED_ROUTES,
        skippedRoutes,
    };
};

