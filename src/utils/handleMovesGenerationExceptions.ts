import { Generation } from "utils";
import { Types } from "./Types";

export const handleMovesGenerationsExceptions = ({
    move,
    generation,
    originalType,
}: {
    move: string;
    generation: Generation;
    originalType: Types;
}): Types => {
    if (generation === Generation.Gen1) {
        if (move === "Bite") return Types.Normal;
        if (move === "Sand Attack") return Types.Normal;
        if (move === "Karate Chop") return Types.Normal;
        if (move === "Gust") return Types.Normal;
    }

    if (
        generation === Generation.Gen1 ||
        generation === Generation.Gen2 ||
        generation === Generation.Gen3 ||
        generation === Generation.Gen4 ||
        generation === Generation.Gen5
    ) {
        if (move === "Charm") return Types.Normal;
        if (move === "Moonlight") return Types.Normal;
        if (move === "Sweet Kiss") return Types.Normal;
    }

    return originalType;
};
