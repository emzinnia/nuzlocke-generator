import { listOfPokemon } from "utils";

export const numberToSpecies = (num: string | number) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    return listOfPokemon[n + 1];
};
