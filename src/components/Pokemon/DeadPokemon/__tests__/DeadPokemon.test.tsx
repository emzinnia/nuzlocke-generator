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

    it("can hide game origin for dead pokemon while the global option is enabled", () => {
        render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={{
                    ...styleDefaults,
                    displayGameOriginForBoxedAndDead: true,
                    displayGameOriginForBoxedPokemon: true,
                    displayGameOriginForDeadPokemon: false,
                }}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
                gameOfOrigin="Red"
            />,
        );

        expect(screen.queryByText("Red")).toBeNull();
    });

    it("shows game origin for dead pokemon by default when the global option is enabled", () => {
        render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={{
                    ...styleDefaults,
                    displayGameOriginForBoxedAndDead: true,
                }}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
                gameOfOrigin="Red"
            />,
        );

        expect(screen.getByText("Red")).toBeTruthy();
    });
});
