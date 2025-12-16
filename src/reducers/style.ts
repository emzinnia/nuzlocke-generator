import {
    Action,
    EDIT_STYLE,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "actions";
import {
    getEditorDarkModePreference,
    styleDefaults,
    Styles,
} from "utils";

const initialStyleState: Styles = {
    ...styleDefaults,
    editorDarkMode: getEditorDarkModePreference(),
};

const mergeStyleWithoutDarkMode = (
    state: Styles,
    next?: Partial<Styles>,
): Styles => {
    const { editorDarkMode: _omit, ...rest } = next || {};
    return {
        ...state,
        ...rest,
        editorDarkMode: state.editorDarkMode,
    };
};

export function style(
    state = initialStyleState,
    action: Action<EDIT_STYLE | REPLACE_STATE | SYNC_STATE_FROM_HISTORY>,
) {
    switch (action.type) {
        case EDIT_STYLE:
            return { ...state, ...action.edits };
        case REPLACE_STATE:
            return mergeStyleWithoutDarkMode(state, action?.replaceWith?.style);
        case SYNC_STATE_FROM_HISTORY:
            return mergeStyleWithoutDarkMode(state, action?.syncWith?.style);
        default:
            return state;
    }
}
