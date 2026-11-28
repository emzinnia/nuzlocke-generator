import { Badge, Game } from "models";
import { getBadges } from "utils";

const checkpointsMatch = (left: Badge[], right: Badge[]) =>
    left.length === right.length &&
    left.every(
        (checkpoint, index) =>
            checkpoint.name === right[index]?.name &&
            checkpoint.image === right[index]?.image,
    );

export const getCheckpointsForSaveImport = (
    checkpoints: Badge[],
    currentGame: Game["name"],
    importedGame: Game["name"],
) =>
    checkpointsMatch(checkpoints, getBadges(currentGame))
        ? getBadges(importedGame)
        : checkpoints;
