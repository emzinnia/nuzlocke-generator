import { Action, MODIFY_DELETION_CONFIRMATION } from "../actions";

export function confirmation(
    state = true,
    action: Action<MODIFY_DELETION_CONFIRMATION>,
) {
    switch (action.type) {
        case MODIFY_DELETION_CONFIRMATION:
            return action.newStatus;
        default:
            return state;
    }
}
