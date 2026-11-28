import { listOfPokemon, Species } from "utils";

export function speciesToNumber(s: Species): number | null {
    if (s == null) return 132;
    return listOfPokemon.indexOf(s) + 1;
}
