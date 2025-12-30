import {
    CHANGE_EDITOR_SIZE,
    Action,
    TOGGLE_MOBILE_RESULT_VIEW,
    TRIGGER_DOWNLOAD,
    SET_BASE_EDITOR_STATE,
} from "actions";
import { Editor } from "models";

export type SET_ZOOM_LEVEL = "SET_ZOOM_LEVEL";
export const SET_ZOOM_LEVEL: SET_ZOOM_LEVEL = "SET_ZOOM_LEVEL";

export function editor(
    state: Editor = {
        minimized: false,
        showResultInMobile: false,
        downloadRequested: 0,
        zoomLevel: 1,
        baseEditors: {},
    },
    action: Action<
        | CHANGE_EDITOR_SIZE
        | TOGGLE_MOBILE_RESULT_VIEW
        | TRIGGER_DOWNLOAD
        | SET_BASE_EDITOR_STATE
        | SET_ZOOM_LEVEL
    >,
) {
    switch (action.type) {
        case CHANGE_EDITOR_SIZE:
            return {
                ...state,
                minimized: action.mode,
            };
        case TOGGLE_MOBILE_RESULT_VIEW:
            return {
                ...state,
                showResultInMobile: !state.showResultInMobile,
            };
        case TRIGGER_DOWNLOAD:
            return {
                ...state,
                downloadRequested: Date.now(),
            };
        case SET_ZOOM_LEVEL:
            return {
                ...state,
                zoomLevel: action.payload,
            };
        case SET_BASE_EDITOR_STATE:
            return {
                ...state,
                baseEditors: {
                    ...(state.baseEditors ?? {}),
                    [action.editorId]: action.isOpen,
                },
            };
        default:
            return state;
    }
}
