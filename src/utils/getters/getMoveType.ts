import { movesByType, Types } from "utils";

export const getMoveType = (move: string): Types => {
    for (const type of Object.keys(movesByType) as Array<keyof typeof movesByType>) {
        if (
            movesByType[type].some((value) => {
                return move.toLowerCase() === value.toLowerCase();
            })
        ) {
            return type;
        }
    }

    return Types.Normal;
};
