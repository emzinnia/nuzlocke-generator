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

/**
 * Box identity is `id`, and drag-reorder uses `position`.
 * Both used to be assigned from `state.length`, so deleting any box
 * other than the last one and then adding a box reused an existing id
 * and position. Later edits and deletes match every box with that id.
 */
export function withUniqueBoxIds(state: Boxes): Boxes {
    const seenIds = new Set<number>();
    const seenPositions = new Set<number>();
    let maxId = -1;
    let maxPosition = -1;

    for (const entry of state) {
        if (typeof entry?.id === "number" && entry.id > maxId) {
            maxId = entry.id;
        }
        if (typeof entry?.position === "number" && entry.position > maxPosition) {
            maxPosition = entry.position;
        }
    }

    let changed = false;
    const next = state.map((entry) => {
        let id = entry.id;
        let position = entry.position;
        let entryChanged = false;

        if (typeof id !== "number" || seenIds.has(id)) {
            maxId += 1;
            id = maxId;
            entryChanged = true;
        }
        seenIds.add(id);

        if (typeof position === "number") {
            if (seenPositions.has(position)) {
                maxPosition += 1;
                position = maxPosition;
                entryChanged = true;
            }
            seenPositions.add(position);
        }

        if (!entryChanged) {
            return entry;
        }
        changed = true;
        return { ...entry, id, position };
    });

    return changed ? next : state;
}

const nextBoxId = (state: Boxes) =>
    state.reduce((max, entry) => Math.max(max, entry.id ?? -1), -1) + 1;

const nextBoxPosition = (state: Boxes) =>
    state.reduce(
        (max, entry) =>
            Math.max(max, typeof entry.position === "number" ? entry.position : -1),
        -1,
    ) + 1;

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
            return Array.isArray(action.replaceWith.box)
                ? withUniqueBoxIds(action.replaceWith.box)
                : action.replaceWith.box;
        case SYNC_STATE_FROM_HISTORY:
            return action.syncWith.box;
        case ADD_BOX: {
            const { name, background = "grass-meadow", inheritFrom } = action;
            const normalized = withUniqueBoxIds(state);
            if (normalized.map((b) => b.name).includes(name)) {
                throw new Error("Cannot name a box the same as a current one.");
            }
            return [
                ...normalized,
                {
                    id: nextBoxId(normalized),
                    name,
                    position: nextBoxPosition(normalized),
                    background,
                    inheritFrom,
                },
            ];
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
