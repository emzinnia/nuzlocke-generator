import { Forme } from "./Forme";
import { Nature } from "./Nature";

export const matchNatureToToxtricityForme = (nature: Nature): keyof typeof Forme => {
    const ampedNatures: Nature[] = [
        Nature.Adamant,
        Nature.Brave,
        Nature.Docile,
        Nature.Hardy,
        Nature.Hasty,
        Nature.Impish,
        Nature.Jolly,
        Nature.Lax,
        Nature.Naive,
        Nature.Naughty,
        Nature.Quirky,
        Nature.Rash,
        Nature.Sassy,
    ];

    return ampedNatures.includes(nature) ? "AmpedUp" : "Lowkey";
};
