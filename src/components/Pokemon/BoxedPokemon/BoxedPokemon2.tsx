import { PokemonIcon } from "components";
import { Pokemon } from "models";
import * as React from "react";

export function BoxedPokemon({ pokemon }: { pokemon: Pokemon }) {
    return (
        <div data-testid="boxed-pokemon">
            <PokemonIcon
                position={pokemon?.position}
                species={pokemon?.species}
                id={pokemon?.id}
                forme={pokemon?.forme}
                shiny={pokemon?.shiny}
                gender={pokemon?.gender}
                egg={pokemon?.egg}
                customIcon={pokemon?.customIcon}
            />
        </div>
    );
}
