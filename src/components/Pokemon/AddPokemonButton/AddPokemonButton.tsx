import * as React from "react";
import { useDispatch } from "react-redux";
import { addPokemon, selectPokemon } from "actions";
import { Button, Intent } from "@blueprintjs/core";
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
            intent={Intent.SUCCESS}
            className="add-new-pokemon"
            data-testid="add-pokemon-button"
            onClick={onClick}
        >
            Add New Pokémon
        </Button>
    );
}
