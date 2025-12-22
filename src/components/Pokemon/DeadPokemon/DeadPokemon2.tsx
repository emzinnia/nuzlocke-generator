import * as React from "react";
import { connect, useDispatch } from "react-redux";

import { Pokemon, Game } from "models";
import { GenderElement } from "components/Common/Shared";
import { gameOfOriginToColor, Styles } from "utils";
import { selectPokemon } from "actions";
import {
    PokemonIcon,
    PokemonIconPlain,
} from "components/Pokemon/PokemonIcon/PokemonIcon";
import { State } from "state";

export function DeadPokemon({ pokemon }: { pokemon: Pokemon }) {
    const dispatch = useDispatch();

    return (
        <span data-testid="dead-pokemon" style={{ filter: "grayscale(100%)" }}>
            <PokemonIconPlain
                onClick={(e) => dispatch(selectPokemon(pokemon.id))}
                {...(pokemon as any)}
            />
        </span>
    );
}
