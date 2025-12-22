import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { sortPokes } from ".";
import { Types } from "./Types";

export function generateEmptyPokemon(
    pokemon?: Pokemon[],
    overrides?: Partial<Pokemon>,
): Pokemon {
    let position: number = 0;
    if (pokemon && pokemon.length > 0) {
        try {
            position =
                parseInt(
                    pokemon.sort(sortPokes)[pokemon.length - 1].position as any,
                ) + 1;
        } catch (e) {
            console.error("Attempted to generate position, but failed.", e);
        }
    }
    const genStatus = () => {
        if (
            pokemon &&
            pokemon.filter((poke) => poke.status === "Team").length >= 6
        )
            return "Boxed";
        return "Team";
    };
    return {
        id: uuid(),
        position: position,
        species: "",
        nickname: "",
        status: genStatus(),
        gender: "genderless",
        level: undefined,
        met: "",
        metLevel: undefined,
        nature: "None",
        ability: "",
        types: [Types.Normal, Types.Normal],
        egg: false,
        gift: false,
        ...(overrides ?? {}),
    };
}
