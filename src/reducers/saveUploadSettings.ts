import {
    Action,
    UPDATE_SAVE_UPLOAD_SETTINGS,
    RESET_SAVE_UPLOAD_SETTINGS,
    SaveUploadSettingsPayload,
} from "../actions";
import { BoxMappings } from "parsers/utils/boxMappings";
import { GameSaveFormat } from "utils";

export interface SaveUploadSettingsState {
    selectedGame: GameSaveFormat;
    boxMappings: BoxMappings;
    mergeDataMode: boolean;
}

const getGameNumberOfBoxes = (game: GameSaveFormat): number => {
    switch (game) {
        case "Auto":
            return 14;
        case "RBY":
            return 12;
        case "GS":
        case "Crystal":
            return 14;
        case "Emerald":
        case "RS":
        case "FRLG":
            return 14;
        default:
            return 12;
    }
};

const generateDefaultBoxMappings = (game: GameSaveFormat): BoxMappings => {
    const count = getGameNumberOfBoxes(game);
    const arr: BoxMappings = [];
    for (let i = 1; i <= count; i++) {
        if (i === 2) {
            arr.push({ key: i, status: "Dead", name: `Box ${i}` });
        } else {
            arr.push({ key: i, status: "Boxed", name: `Box ${i}` });
        }
    }
    return arr;
};

const initialState: SaveUploadSettingsState = {
    selectedGame: "Auto",
    boxMappings: generateDefaultBoxMappings("Auto"),
    mergeDataMode: true,
};

export function saveUploadSettings(
    state = initialState,
    action: Action<UPDATE_SAVE_UPLOAD_SETTINGS | RESET_SAVE_UPLOAD_SETTINGS>,
): SaveUploadSettingsState {
    switch (action.type) {
        case UPDATE_SAVE_UPLOAD_SETTINGS: {
            const payload = action.payload as SaveUploadSettingsPayload;
            const newState = { ...state };

            if (payload.selectedGame !== undefined) {
                newState.selectedGame = payload.selectedGame;
                // When game changes, regenerate box mappings if not explicitly provided
                if (payload.boxMappings === undefined) {
                    newState.boxMappings = generateDefaultBoxMappings(payload.selectedGame);
                }
            }

            if (payload.boxMappings !== undefined) {
                newState.boxMappings = payload.boxMappings;
            }

            if (payload.mergeDataMode !== undefined) {
                newState.mergeDataMode = payload.mergeDataMode;
            }

            return newState;
        }
        case RESET_SAVE_UPLOAD_SETTINGS:
            return initialState;
        default:
            return state;
    }
}

// Export helper for generating default mappings (used by components)
export { generateDefaultBoxMappings };

