import {
    Action,
    NEW_NUZLOCKE,
    DELETE_NUZLOCKE,
    SWITCH_NUZLOCKE,
    UPDATE_NUZLOCKE,
    UPDATE_SWITCH_NUZLOCKE,
} from "actions";
import { v4 as uuid } from "uuid";

export interface NuzlockeSaveEntry {
    id: string;
    data: string;
    isCopy?: boolean;
}

export interface Nuzlockes {
    currentId: string;
    saves: NuzlockeSaveEntry[];
}

const updateSaveInPlace = (
    saves: NuzlockeSaveEntry[],
    id: string,
    data: string,
): NuzlockeSaveEntry[] => {
    const index = saves.findIndex((save) => save.id === id);
    if (index === -1) {
        return [
            ...saves,
            {
                id,
                data,
            },
        ];
    }

    return saves.map((save, saveIndex) =>
        saveIndex === index
            ? {
                  ...save,
                  data,
              }
            : save,
    );
};

export function nuzlockes(
    state: Nuzlockes = {
        currentId: "",
        saves: [],
    },
    action: Action<
        | NEW_NUZLOCKE
        | DELETE_NUZLOCKE
        | SWITCH_NUZLOCKE
        | UPDATE_NUZLOCKE
        | UPDATE_SWITCH_NUZLOCKE
    >,
) {
    switch (action.type) {
        case NEW_NUZLOCKE: {
            const id = uuid();
            return {
                ...state,
                currentId: id,
                saves: [
                    ...state.saves,
                    {
                        id,
                        data: action?.data || null,
                        isCopy: action?.isCopy || false,
                    },
                ],
            };
        }

        case DELETE_NUZLOCKE:
            return {
                ...state,
                saves: state.saves.filter((s) => s.id !== action.id),
            };
        case SWITCH_NUZLOCKE:
            return {
                ...state,
                currentId: action.id,
            };
        case UPDATE_SWITCH_NUZLOCKE:
            return {
                ...state,
                currentId: action.newId,
                saves: updateSaveInPlace(state.saves, action.id, action.data),
            };
        case UPDATE_NUZLOCKE:
            // const updateItem = state.saves.find(s => s.id === action.id);
            // console.log('updateItem', updateItem);

            // if (!updateItem) {
            //     return {
            //         ...state,
            //         saves: [
            //             ...state.saves.filter(s => s.id !== action.id),
            //             {
            //                 id: uuid(),
            //                 data: action.data,
            //             }
            //         ]
            //     };
            // }
            return {
                ...state,
                saves: updateSaveInPlace(state.saves, action.id, action.data),
            };
        default:
            return state;
    }
}
