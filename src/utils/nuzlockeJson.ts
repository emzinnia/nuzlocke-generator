import { State } from "state";
import { Styles } from "./styleDefaults";
import { omit } from "ramda";

export const stripEditorDarkModeForExport = (state: State) => {
    const baseState = omit(
        ["router", "._persist", "_persist", "editorHistory"],
        state,
    ) as {
        style?: Styles;
        [key: string]: unknown;
    };
    const { editorDarkMode: _omit, ...styleWithoutDarkMode } =
        baseState.style || {};

    return {
        ...baseState,
        style: styleWithoutDarkMode,
    };
};

export const serializeNuzlockeJson = (state: State) =>
    JSON.stringify(stripEditorDarkModeForExport(state));

export const serializeNuzlockeSaveData = (state: State) => {
    const saveData = omit(
        ["router", "._persist", "_persist", "editorHistory", "nuzlockes"],
        state,
    ) as {
        style?: Styles;
        [key: string]: unknown;
    };
    const { editorDarkMode: _omit, ...styleWithoutDarkMode } =
        saveData.style || {};

    return JSON.stringify({
        ...saveData,
        style: styleWithoutDarkMode,
    });
};
