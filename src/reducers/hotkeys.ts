import {
    Action,
    EDIT_HOTKEY,
    RESET_HOTKEY,
    RESET_ALL_HOTKEYS,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "actions";

export type HotkeyBindings = Record<string, string>;

const defaultHotkeys: HotkeyBindings = {};

export function hotkeys(
    state: HotkeyBindings = defaultHotkeys,
    action: Action<
        | EDIT_HOTKEY
        | RESET_HOTKEY
        | RESET_ALL_HOTKEYS
        | REPLACE_STATE
        | SYNC_STATE_FROM_HISTORY
    >,
): HotkeyBindings {
    switch (action.type) {
        case EDIT_HOTKEY:
            return {
                ...state,
                [action.edit.actionName]: action.edit.key,
            };
        case RESET_HOTKEY: {
            const newState = { ...state };
            delete newState[action.actionName];
            return newState;
        }
        case RESET_ALL_HOTKEYS:
            return defaultHotkeys;
        case REPLACE_STATE:
            return action.replaceWith?.hotkeys ?? defaultHotkeys;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith?.hotkeys ?? defaultHotkeys;
        default:
            return state;
    }
}

