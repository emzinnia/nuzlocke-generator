import {
    CREATE_CUSTOM_TYPE,
    Action,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    DELETE_CUSTOM_TYPE,
    EDIT_CUSTOM_TYPE,
} from "actions";
import { State } from "state";
import { v4 as uuid } from "uuid";

export function customTypes(
    state: State["customTypes"] = [],
    action: Action<
        | CREATE_CUSTOM_TYPE
        | DELETE_CUSTOM_TYPE
        | REPLACE_STATE
        | SYNC_STATE_FROM_HISTORY
        | EDIT_CUSTOM_TYPE
    >,
) {
    switch (action.type) {
        case CREATE_CUSTOM_TYPE:
            return [
                ...state,
                {
                    id: uuid(),
                    ...action.typeInfo,
                },
            ];
        case DELETE_CUSTOM_TYPE:
            return state.filter((type) => type.id !== action.id);
        case EDIT_CUSTOM_TYPE:
            return state.map((type) => {
                if (type.id !== action.id) {
                    return type;
                }
                return {
                    ...type,
                    ...action.typeInfo,
                };
            });
        case REPLACE_STATE:
            return Array.isArray(action.replaceWith?.customTypes)
                ? action.replaceWith.customTypes
                : state;
        case SYNC_STATE_FROM_HISTORY:
            return Array.isArray(action.syncWith?.customTypes)
                ? action.syncWith.customTypes
                : state;
        default:
            return state;
    }
}
