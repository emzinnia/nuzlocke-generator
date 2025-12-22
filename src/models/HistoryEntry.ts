/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
export interface HistoryEntry {
    id: string;
    timestamp: Date;
    type: "Pokemon" | "Trainer" | "Game" | "Meta";
    original: any;
    new: any;
}
