import {
    CHANGE_EDITOR_SIZE,
    Action,
    TOGGLE_TEMTEM_MODE,
    TOGGLE_MOBILE_RESULT_VIEW,
    TRIGGER_DOWNLOAD,
} from "actions";
import { Editor } from "models";

export type SET_ZOOM_LEVEL = "SET_ZOOM_LEVEL";
export const SET_ZOOM_LEVEL: SET_ZOOM_LEVEL = "SET_ZOOM_LEVEL";

export function editor(
    state: Editor = {
        minimized: false,
        temtemMode: false,
        showResultInMobile: false,
        monsterType: "Pokémon",
        downloadRequested: 0,
        zoomLevel: 1,
    },
    action: Action<
        | CHANGE_EDITOR_SIZE
        | TOGGLE_TEMTEM_MODE
        | TOGGLE_MOBILE_RESULT_VIEW
        | TRIGGER_DOWNLOAD
        | SET_ZOOM_LEVEL
    >,
) {
    switch (action.type) {
        case CHANGE_EDITOR_SIZE:
            return {
                ...state,
                minimized: action.mode,
            };
        case TOGGLE_TEMTEM_MODE:
            return {
                ...state,
                temtemMode: !state.temtemMode,
                monsterType: !state.temtemMode ? "TemTem" : "Pokémon",
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
        default:
            return state;
    }
}
