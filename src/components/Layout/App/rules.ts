import { EDIT_RULE, ADD_RULE, DELETE_RULE, RESET_RULES, Action } from "actions";

const initialState = [
    "Each Pokémon that faints is considered dead and must be released or permaboxed",
    "You can only catch the first Pokémon you encounter in an area",
    "All Pokémon must be nicknamed",
];

export function rules(
    state: string[] = initialState,
    action: Action<EDIT_RULE | ADD_RULE | DELETE_RULE | RESET_RULES>,
) {
    switch (action.type) {
        case ADD_RULE:
            return [...state, ""];
        case EDIT_RULE: {
            const newState = state;
            newState[action.target] = action.rule;
            return newState;
        }
        case DELETE_RULE:
            return state.filter((_, i) => i !== action.target);
        case RESET_RULES:
            return initialState;
        default:
            return state;
    }
}
