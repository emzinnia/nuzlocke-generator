import { Buffer } from "buffer";
import { GameSaveFormat } from "utils";

export type Save = {
    file: Buffer;
};

// Runs heuristics against file to determine how to parse
export function detectSaveType(file: Buffer, override?: GameSaveFormat) {
    const format: GameSaveFormat = isRBY(file)
        ? "RBY"
        : isCrystal(file)
          ? "Crystal"
          : "GS";

    return {
        file,
        format,
    };
}

const isCrystal = (file) => {
    return false;
};
const isRBY = (file) => {
    return true;
};
