import { Action } from "./action";
import { HistoryEntry } from "models";

export type REMOVE_HISTORY_ENTRY = "REMOVE_HISTORY_ENTRY";
export const REMOVE_HISTORY_ENTRY: REMOVE_HISTORY_ENTRY =
    "REMOVE_HISTORY_ENTRY";

export type removeHistoryEntry = (
    id: HistoryEntry["id"],
) => Action<REMOVE_HISTORY_ENTRY, string>;
export const removeHistoryEntry = (
    id: string,
): Action<REMOVE_HISTORY_ENTRY, string> => {
    return {
        type: REMOVE_HISTORY_ENTRY,
        id,
    };
};
