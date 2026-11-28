import * as React from "react";

export type GenderElementProps =
    | "Male"
    | "m"
    | "Female"
    | "f"
    | "genderless"
    | null
    | undefined;

export class Gender {
    public static isMale(gender: GenderElementProps) {
        if (gender === "m" || gender === "Male") return true;
        return false;
    }

    public static isFemale(gender: GenderElementProps) {
        if (gender === "f" || gender === "Female") return true;
        return false;
    }

    public static isGenderless(gender: GenderElementProps) {
        if (gender === "genderless" || gender == null) return true;
        return false;
    }
}

export const GenderElement = (gender: GenderElementProps) => {
    if (gender === "Male" || gender === "m") {
        return (
            <span
                data-testid="gender-text"
                className="pokemon-gender gender-color-male"
            >
                &#9794;
            </span>
        );
    } else if (gender === "Female" || gender === "f") {
        return (
            <span
                data-testid="gender-text"
                className="pokemon-gender gender-color-female"
            >
                &#9792;
            </span>
        );
    } else {
        return null;
    }
};

export function GenderElementReact({ gender }) {
    return GenderElement(gender);
}
