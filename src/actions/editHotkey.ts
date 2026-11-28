import { Action } from "./action";

export type EDIT_HOTKEY = "EDIT_HOTKEY";
export const EDIT_HOTKEY: EDIT_HOTKEY = "EDIT_HOTKEY";

export type RESET_HOTKEY = "RESET_HOTKEY";
export const RESET_HOTKEY: RESET_HOTKEY = "RESET_HOTKEY";

export type RESET_ALL_HOTKEYS = "RESET_ALL_HOTKEYS";
export const RESET_ALL_HOTKEYS: RESET_ALL_HOTKEYS = "RESET_ALL_HOTKEYS";

export interface HotkeyEdit {
    actionName: string;
    key: string;
}

export type editHotkey = (edit: HotkeyEdit) => Action<EDIT_HOTKEY>;
export function editHotkey(edit: HotkeyEdit): Action<EDIT_HOTKEY> {
    return {
        type: EDIT_HOTKEY,
        edit,
    };
}

export type resetHotkey = (actionName: string) => Action<RESET_HOTKEY>;
export function resetHotkey(actionName: string): Action<RESET_HOTKEY> {
    return {
        type: RESET_HOTKEY,
        actionName,
    };
}

export type resetAllHotkeys = () => Action<RESET_ALL_HOTKEYS>;
export function resetAllHotkeys(): Action<RESET_ALL_HOTKEYS> {
    return {
        type: RESET_ALL_HOTKEYS,
    };
}

