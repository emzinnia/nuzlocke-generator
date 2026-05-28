import {
    Action,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    UPDATE_NICKNAME_PRESETS,
} from "../actions";
import { State } from "state";

export function nicknamePresets(
    state: State["nicknamePresets"] = [],
    action: Action<
        UPDATE_NICKNAME_PRESETS | REPLACE_STATE | SYNC_STATE_FROM_HISTORY
    >,
) {
    switch (action.type) {
        case UPDATE_NICKNAME_PRESETS:
            return action.nicknamePresets;
        case REPLACE_STATE:
            return action.replaceWith.nicknamePresets ?? [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.nicknamePresets ?? [];
        default:
            return state;
    }
}
