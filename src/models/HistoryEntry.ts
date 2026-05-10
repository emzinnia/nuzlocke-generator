export interface HistoryEntry {
    id: string;
    timestamp: Date;
    type: "Pokemon" | "Trainer" | "Game" | "Meta";
    original: unknown;
    new: unknown;
}
