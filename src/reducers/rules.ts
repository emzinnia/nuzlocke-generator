import {
    EDIT_RULE,
    ADD_RULE,
    DELETE_RULE,
    RESET_RULES,
    Action,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "actions";

const initialState = [
    "Each Pokémon that faints is considered dead and must be released or permaboxed",
    "You can only catch the first Pokemon you encounter in an area",
    "All Pokémon must be nicknamed",
];

export function rules(
    state: string[] = initialState,
    action: Action<
        EDIT_RULE | ADD_RULE | DELETE_RULE | RESET_RULES | REPLACE_STATE | SYNC_STATE_FROM_HISTORY
    >,
) {
    switch (action.type) {
        case ADD_RULE:
            return [...state, ""];
        case EDIT_RULE:
            return state.map((rule, index) => {
                if (index !== action.target) {
                    return rule;
                }
                return action.rule;
            });
        case DELETE_RULE:
            return state.filter((_, index) => index + 1 !== action.target);
        case REPLACE_STATE:
            return action.replaceWith.rules;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.rules;
        case RESET_RULES:
            return initialState;
        default:
            return state;
    }
}
