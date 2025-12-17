import {
    EDIT_CUSTOM_MOVE_MAP,
    DELETE_CUSTOM_MOVE,
    Action,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    VERSION_1116,
} from "actions";
import { v4 as uuid } from "uuid";
import { State } from "state";

const initialState = [];

export function customMoveMap(
    state: State["customMoveMap"] = initialState,
    action: Action<
        EDIT_CUSTOM_MOVE_MAP | DELETE_CUSTOM_MOVE | REPLACE_STATE | SYNC_STATE_FROM_HISTORY | VERSION_1116
    >,
) {
    switch (action.type) {
        case EDIT_CUSTOM_MOVE_MAP:
            // const nState = state;
            // const type = action.moveType;
            // const name = action.moveName;

            // const arr = nState[type] ? [...nState[type], name] : [name];
            // nState[type] = arr;

            return [
                ...state,
                {
                    id: uuid(),
                    type: action.moveType,
                    move: action.moveName,
                },
            ];
        case DELETE_CUSTOM_MOVE:
            return state.filter((move) => move.id !== action.id);
        case REPLACE_STATE:
            return action.replaceWith.customMoveMap || [];
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.customMoveMap || [];
        case VERSION_1116:
            return [];
        default:
            return state;
    }
}
