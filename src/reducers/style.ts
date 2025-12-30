import {
    Action,
    EDIT_STYLE,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "actions";
// Import directly to avoid circular dependency through utils barrel
import { getEditorDarkModePreference } from "utils/editorDarkModePreference";
import { styleDefaults, Styles } from "utils/styleDefaults";

// Lazy-initialize default state to avoid circular dependency issues
let initialStyleState: Styles | null = null;
function getDefaultStyleState(): Styles {
    if (initialStyleState === null) {
        initialStyleState = {
            ...styleDefaults,
            editorDarkMode: getEditorDarkModePreference(),
        };
    }
    return initialStyleState;
}

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
    state = getDefaultStyleState(),
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
