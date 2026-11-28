import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { Types } from "./Types";

/** Next free position without mutating the source array (Array.sort is in-place). */
export function getNextPokemonPosition(pokemon?: Pokemon[]): number {
    if (!pokemon?.length) {
        return 0;
    }

    let maxPosition = -1;
    for (const poke of pokemon) {
        const position = Number(poke.position);
        if (Number.isFinite(position) && position > maxPosition) {
            maxPosition = position;
        }
    }

    return maxPosition + 1;
}

export function generateEmptyPokemon(
    pokemon?: Pokemon[],
    overrides?: Partial<Pokemon>,
): Pokemon {
    const position = getNextPokemonPosition(pokemon);
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
