import { typeToColor, Types } from "utils";
import { State } from "state";

export const getBackgroundGradient = (
    typeA: keyof typeof Types,
    typeB: keyof typeof Types,
    customTypes: State["customTypes"],
): string => {
    if (typeB == null) {
        if (typeA == null) {
            return "transparent";
        } else {
            return `linear-gradient(to right, ${typeToColor(typeA, customTypes)}, ${typeToColor(
                typeA,
                customTypes,
            )}`;
        }
    } else {
        return `linear-gradient(to right, ${typeToColor(typeA, customTypes)}, ${typeToColor(
            typeB,
            customTypes,
        )}`;
    }
};
