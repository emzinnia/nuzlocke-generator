import { Action } from "./action";
import { BoxMappings } from "parsers/utils/boxMappings";
import { GameSaveFormat } from "utils";

export type UPDATE_SAVE_UPLOAD_SETTINGS = "UPDATE_SAVE_UPLOAD_SETTINGS";
export const UPDATE_SAVE_UPLOAD_SETTINGS: UPDATE_SAVE_UPLOAD_SETTINGS =
    "UPDATE_SAVE_UPLOAD_SETTINGS";

export type RESET_SAVE_UPLOAD_SETTINGS = "RESET_SAVE_UPLOAD_SETTINGS";
export const RESET_SAVE_UPLOAD_SETTINGS: RESET_SAVE_UPLOAD_SETTINGS =
    "RESET_SAVE_UPLOAD_SETTINGS";

export interface SaveUploadSettingsPayload {
    selectedGame?: GameSaveFormat;
    boxMappings?: BoxMappings;
    mergeDataMode?: boolean;
}

export type updateSaveUploadSettings = (
    payload: SaveUploadSettingsPayload,
) => Action<UPDATE_SAVE_UPLOAD_SETTINGS>;

export const updateSaveUploadSettings = (
    payload: SaveUploadSettingsPayload,
): Action<UPDATE_SAVE_UPLOAD_SETTINGS> => {
    return {
        type: UPDATE_SAVE_UPLOAD_SETTINGS,
        payload,
    };
};

export type resetSaveUploadSettings = () => Action<RESET_SAVE_UPLOAD_SETTINGS>;

export const resetSaveUploadSettings = (): Action<RESET_SAVE_UPLOAD_SETTINGS> => {
    return {
        type: RESET_SAVE_UPLOAD_SETTINGS,
    };
};

