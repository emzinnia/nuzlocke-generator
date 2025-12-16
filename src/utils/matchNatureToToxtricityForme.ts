import { Forme } from "./Forme";
import { Nature } from "./Nature";

export const matchNatureToToxtricityForme = (nature: Nature): keyof typeof Forme => {
    const ampedNatures: Nature[] = [
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
    ];

    return ampedNatures.includes(nature) ? "Amped" : "Lowkey";
};
