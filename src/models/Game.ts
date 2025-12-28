// Import directly to avoid circular dependency through utils barrel
import type { Game as GameFromUtils } from "utils/data/listOfGames";

export interface Game {
    name: GameFromUtils;
    customName: string;
}
