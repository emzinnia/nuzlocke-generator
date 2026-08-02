import { v4 as uuid } from "uuid";
import { Pokemon } from "models";
import { sortPokes } from ".";
import { Types } from "./Types";

/** Next free position without requiring a contiguous 0..n position list. */
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
    let position: number = 0;
    if (pokemon && pokemon.length > 0) {
        try {
            const nextPosition =
                Number(pokemon.sort(sortPokes)[pokemon.length - 1].position) +
                1;
            position = Number.isFinite(nextPosition) ? nextPosition : 0;
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
