import type { State } from "state";

export const normalizeCustomMoveMap = (
    customMoveMap: unknown,
): State["customMoveMap"] => {
    if (!Array.isArray(customMoveMap)) return [];

    return customMoveMap.flatMap((entry, index) => {
        if (!entry || typeof entry !== "object") return [];

        const { id, move, type } = entry as {
            id?: unknown;
            move?: unknown;
            type?: unknown;
        };

        if (
            typeof move !== "string" ||
            typeof type !== "string" ||
            !move.trim() ||
            !type.trim()
        ) {
            return [];
        }

        return [
            {
                id:
                    typeof id === "string" && id.trim()
                        ? id
                        : `custom-move-${index}`,
                move,
                type,
            },
        ];
    });
};
