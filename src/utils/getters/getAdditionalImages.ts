import { State } from "state";
import { Pokemon } from "models";

export const getTotalImageCount = (species?: Pokemon["species"]) => {
    if (species === "Bulbasaur") {
        return 2;
    }

    return 1;
};
