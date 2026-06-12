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

export const stripVolatileSavedNuzlockeFields = (state: State) => {
    const baseState = omit(["nuzlockes", "editorHistory"], state) as {
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

export const serializeNuzlockeSaveData = (state: State) =>
    JSON.stringify(stripVolatileSavedNuzlockeFields(state));

export const getReplacementNuzlockeSave = <T extends { id: string }>(
    saves: T[],
    deletedId: string,
) => saves.find((save) => save.id !== deletedId);
