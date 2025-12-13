import * as React from "react";
import { useDispatch } from "react-redux";
import { addPokemon, selectPokemon } from "actions";
import { Button } from "components/Common/ui";
import { Pokemon } from "models";

export function AddPokemonButton({ pokemon }: { pokemon: Pokemon }) {
    const dispatch = useDispatch();

    const onClick = () => {
        dispatch(addPokemon(pokemon));
        dispatch(selectPokemon(pokemon.id));
    };

    return (
        <Button
            icon="add"
            intent="success"
            className="add-new-pokemon"
            onClick={onClick}
        >
            Add New Pokémon
        </Button>
    );
}
