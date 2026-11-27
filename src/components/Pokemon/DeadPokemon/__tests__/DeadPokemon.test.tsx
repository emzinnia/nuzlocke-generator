import * as React from "react";
import { DeadPokemonBase } from "../DeadPokemon";
import { generateEmptyPokemon, styleDefaults } from "utils";
import { render, screen } from "utils/testUtils";

const poke = {
    ...generateEmptyPokemon(),
    species: "Pikachu",
    nickname: "Pikazzy",
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

    it("hides the pokemon name when configured", () => {
        render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={{ ...styleDefaults, hidePokemonNames: true }}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
            />,
        );

        expect(screen.queryByText(poke.nickname)).toBeNull();
        expect(screen.getByText(/Levels 3/)).toBeTruthy();
        expect(screen.getByTestId("cause-of-death").textContent).toContain(
            poke.causeOfDeath,
        );
    });
});
