import {
    EDIT_BOX,
    REPLACE_STATE,
    SYNC_STATE_FROM_HISTORY,
    VERSION_0_0_6_BETA,
    Action,
    ADD_BOX,
    DELETE_BOX,
    UPDATE_BOXES,
} from "actions";
import { Boxes } from "models";

const defaultBoxes: Boxes = [
    {
        id: 0,
        position: 0,
        name: "Team",
    },
    {
        id: 1,
        position: 1,
        name: "Boxed",
    },
    {
        id: 2,
        position: 2,
        name: "Dead",
    },
    {
        id: 3,
        position: 3,
        name: "Champs",
    },
];

export function box(
    state = defaultBoxes,
    action: Action<
        | EDIT_BOX
        | REPLACE_STATE
        | SYNC_STATE_FROM_HISTORY
        | VERSION_0_0_6_BETA
        | ADD_BOX
        | DELETE_BOX
        | UPDATE_BOXES
    >,
) {
    switch (action.type) {
        case EDIT_BOX: {
            const box = state.find((box) => box.id === action.id);
            if (!box) {
                return state;
            }
            const newBox = { ...box, ...action.edits };
            return [...state.filter((box) => box.id !== action.id), newBox];
        }
        case REPLACE_STATE:
            return action.replaceWith.box;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.box;
        case ADD_BOX: {
            const { name, background = "grass-meadow", inheritFrom } = action;
            const id = state.length;
            const position = state.length;
            if (state.map((b) => b.name).includes(name)) {
                throw new Error("Cannot name a box the same as a current one.");
            }
            return [...state, { id, name, position, background, inheritFrom }];
        }
        case DELETE_BOX:
            return state.filter((box) => box.id !== action.id);
        case UPDATE_BOXES:
            if (state[0].position == null) {
                return state.map((box, index) => ({
                    ...box,
                    id: index,
                    position: index,
                }));
            }
            return state;
        case VERSION_0_0_6_BETA:
            return defaultBoxes;
        default:
            return state;
    }
}
