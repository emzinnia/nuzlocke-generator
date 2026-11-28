import { Action } from "./action";
import { HistoryEntry } from "models";

export type ADD_HISTORY_ENTRY = "ADD_HISTORY_ENTRY";
export const ADD_HISTORY_ENTRY: ADD_HISTORY_ENTRY = "ADD_HISTORY_ENTRY";

export type addHistoryEntry = (
    he: HistoryEntry,
) => Action<ADD_HISTORY_ENTRY, HistoryEntry>;
export const addHistoryEntry = (
    historyEntry: HistoryEntry,
): Action<ADD_HISTORY_ENTRY, HistoryEntry> => {
    return {
        type: ADD_HISTORY_ENTRY,
        historyEntry,
    };
};
