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
                onClick={() => dispatch(selectPokemon(pokemon.id))}
                id={pokemon.id}
                species={pokemon.species}
                forme={pokemon.forme}
                gender={pokemon.gender}
                customIcon={pokemon.customIcon}
                hidden={pokemon.hidden}
                egg={pokemon.egg}
                position={pokemon.position}
                shiny={pokemon.shiny}
                status={pokemon.status}
                selectedId={null}
                imageStyle={{ height: "32px", maxWidth: "auto" }}
            />
        </span>
    );
}
