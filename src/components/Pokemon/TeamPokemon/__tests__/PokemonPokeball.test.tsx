import * as React from "react";
import { render } from "@testing-library/react";
import { PokemonPokeball } from "../PokemonPokeball";
import { styleDefaults } from "utils";

const pokemon = {
    id: "p1",
    species: "Snorlax",
    types: ["Normal", "Normal"],
    pokeball: "Great Ball",
} as any;

describe("<PokemonPokeball />", () => {
    it("renders pokeball image when present", () => {
        const { getByAltText } = render(
            <PokemonPokeball
                pokemon={pokemon}
                style={{ ...styleDefaults, pokeballStyle: "round" }}
                customTypes={[]}
            />,
        );

        expect(getByAltText("Great Ball")).toBeTruthy();
    });

    it("does not render when pokeball is None", () => {
        const { container } = render(
            <PokemonPokeball
                pokemon={{ ...pokemon, pokeball: "None" }}
                style={styleDefaults}
                customTypes={[]}
            />,
        );

        expect(container.firstChild).toBeNull();
    });
});

