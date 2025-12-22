import { Action } from "./action";
import { SET_ZOOM_LEVEL } from "reducers/editor";

export type setZoomLevel = (level: number) => Action<typeof SET_ZOOM_LEVEL, number>;
export const setZoomLevel = (level: number): Action<typeof SET_ZOOM_LEVEL, number> => {
    return {
        type: SET_ZOOM_LEVEL,
        payload: level,
    };
};

