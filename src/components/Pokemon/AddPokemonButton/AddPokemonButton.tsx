import * as React from "react";
import { useDispatch } from "react-redux";
import { addPokemon, selectPokemon } from "actions";
import { Button, Intent } from "components/ui";
import { Pokemon } from "models";
import { HotkeyIndicator } from "components/Common/Shared";

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
            data-testid="add-pokemon-button"
            onClick={onClick}
            style={{ whiteSpace: "nowrap" }}
        >
            Add New Pokémon{" "}
            <HotkeyIndicator
                hotkey="n"
                showModifier={false}
                style={{ marginLeft: "0.35rem" }}
            />
        </Button>
    );
}
