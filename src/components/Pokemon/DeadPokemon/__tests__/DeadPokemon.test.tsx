import * as React from "react";
import { DeadPokemonBase } from "../DeadPokemon";
import { generateEmptyPokemon, styleDefaults, Types } from "utils";
import { render, screen } from "utils/testUtils";

const poke = {
    ...generateEmptyPokemon(),
    species: "Pikachu",
    nickname: "Pikazzy",
    types: [Types.Electric, Types.Electric] as [Types, Types],
    level: 50,
    metLevel: 3,
    causeOfDeath: "Died doing what he loved.",
};

describe("<DeadPokemon />", () => {
    it("renders its content", () => {
        render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={styleDefaults}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
            />,
        );
        expect(screen.getByTestId("cause-of-death").textContent).toContain(
            poke.causeOfDeath,
        );
    });

    it("uses type-colored backgrounds when selected", () => {
        const { container } = render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={{ ...styleDefaults, pokemonBackgroundSource: "type" }}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
            />,
        );

        const deadPokemon = container.querySelector(
            ".dead-pokemon-container",
        ) as HTMLElement;
        expect(deadPokemon.style.backgroundImage).toContain("#E3E039");
    });
});
