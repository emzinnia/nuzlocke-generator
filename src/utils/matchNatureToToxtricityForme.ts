import { Forme } from "./Forme";
import { Nature } from "./Nature";

export const matchNatureToToxtricityForme = (
    nature: Nature,
): keyof typeof Forme => {
    console.log(nature);

    if (
        [
            "Adamant",
            "Brave",
            "Docile",
            "Hardy",
            "Hasty",
            "Impish",
            "Jolly",
            "Lax",
            "Naive",
            "Naughty",
            "Quirky",
            "Rash",
            "Sassy",
        ].includes(nature)
    ) {
        return "AmpedUp";
    } else {
        return "Lowkey";
    }
};
