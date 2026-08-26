import * as React from "react";
import { DeadPokemonBase } from "../DeadPokemon";
import { generateEmptyPokemon, styleDefaults } from "utils";
import { render, screen } from "utils/testUtils";
import { resetCheckpoints } from "actions";
import { store } from "store";

const poke = {
    ...generateEmptyPokemon(),
    species: "Pikachu",
    nickname: "Pikazzy",
    level: 50,
    metLevel: 3,
    causeOfDeath: "Died doing what he loved.",
};

describe("<DeadPokemon />", () => {
    beforeEach(() => {
        store.dispatch(resetCheckpoints("Red"));
    });

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

    it("renders checkpoint badges earned before death", () => {
        render(
            <DeadPokemonBase
                game={{ name: "Red", customName: "" }}
                style={styleDefaults}
                selectPokemon={vi.fn()}
                minimal={false}
                {...poke}
                checkpoints={[
                    { name: "Boulder Badge", image: "boulder-badge" },
                ]}
            />,
        );

        expect(screen.getByAltText("Boulder Badge").className).toContain(
            "obtained",
        );
        expect(screen.getByAltText("Cascade Badge").className).toContain(
            "not-obtained",
        );
    });
});
