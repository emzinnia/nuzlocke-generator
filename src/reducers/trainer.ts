import {
    Action,
    DELETE_CHECKPOINT,
    EDIT_CHECKPOINT,
    EDIT_TRAINER,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
} from "../actions";
import { Badge } from "models";

type TrainerState = {
    badges?: Badge[];
    [key: string]: unknown;
};

const renameMatchingBadges = (
    badges: Badge[] | undefined,
    name: string,
    edits: Partial<Badge>,
): Badge[] | undefined => {
    if (!Array.isArray(badges)) {
        return badges;
    }
    let changed = false;
    const next = badges.map((badge) => {
        if (badge.name !== name) {
            return badge;
        }
        changed = true;
        return { ...badge, ...edits };
    });
    return changed ? next : badges;
};

const removeMatchingBadges = (
    badges: Badge[] | undefined,
    name: string,
): Badge[] | undefined => {
    if (!Array.isArray(badges)) {
        return badges;
    }
    const next = badges.filter((badge) => badge.name !== name);
    return next.length === badges.length ? badges : next;
};

export function trainer(
    state: TrainerState = { badges: [] },
    action: Action<
        | EDIT_TRAINER
        | EDIT_CHECKPOINT
        | DELETE_CHECKPOINT
        | REPLACE_STATE
        | SYNC_STATE_FROM_HISTORY
    >,
) {
    switch (action.type) {
        case EDIT_TRAINER:
            return { ...state, ...action.edits };
        case EDIT_CHECKPOINT: {
            const badges = renameMatchingBadges(
                state.badges,
                action.name,
                action.edits,
            );
            return badges === state.badges ? state : { ...state, badges };
        }
        case DELETE_CHECKPOINT: {
            const badges = removeMatchingBadges(state.badges, action.name);
            return badges === state.badges ? state : { ...state, badges };
        }
        case REPLACE_STATE:
            return action.replaceWith.trainer;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith?.trainer ?? state;
        default:
            return state;
    }
}
