import { Action, SEE_RELEASE } from "actions";

export function sawRelease(
    state = {},
    action: Action<SEE_RELEASE, string | undefined>,
) {
    switch (action.type) {
        case SEE_RELEASE: {
            const release = action?.release;
            return release ? { ...state, [release]: true } : state;
        }
        default: {
            return state;
        }
    }
}
