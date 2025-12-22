import {
    Action,
    NEW_NUZLOCKE,
    DELETE_NUZLOCKE,
    SWITCH_NUZLOCKE,
    UPDATE_NUZLOCKE,
    UPDATE_SWITCH_NUZLOCKE,
} from "actions";
import { v4 as uuid } from "uuid";

export interface Nuzlockes {
    currentId: string;
    saves: any[];
}

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
                saves: [
                    ...state.saves.filter((s) => s.id !== action.id),
                    {
                        id: action.id,
                        data: action.data,
                    },
                ],
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
                saves: [
                    ...state.saves.filter((s) => s.id !== action.id),
                    {
                        id: action.id,
                        data: action.data,
                    },
                ],
            };
        default:
            return state;
    }
}
