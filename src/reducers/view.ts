import { Action, TOGGLE_DIALOG } from "actions";
import { View } from "models";

export function view(
    state: View = {
        dialogs: {
            imageUploader: false,
            typeMatchups: false,
        },
    },
    action: Action<TOGGLE_DIALOG>,
) {
    switch (action.type) {
        case TOGGLE_DIALOG:
            return {
                ...state,
                dialogs: {
                    ...state.dialogs,
                    [action.dialog]: state?.dialogs?.[action.dialog]
                        ? false
                        : true,
                },
            };
        default:
            return state;
    }
}
