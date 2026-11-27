import { render, screen } from "utils/testUtils";
import { Pokemon } from "models";
import * as React from "react";
import { Types } from "utils";
import { TeamPokemon, TeamPokemonProps } from "../TeamPokemon2";

describe(TeamPokemon.name, () => {
    const Pikachu: Pokemon = {
        id: "test",
        species: "Pikachu",
        nickname: "Sparky",
        types: [Types.Electric, Types.Electric],
    };
    const baseProps: TeamPokemonProps = {
        pokemon: Pikachu,
        options: {
            height: "8rem",
        },
    };

    it("renders [no customs]", () => {
        render(<TeamPokemon {...baseProps} />);
        expect(screen.getByTestId("team-pokemon")).toBeTruthy();
    });

    it("renders [custom HTML]", () => {
        const props: TeamPokemonProps = {
            ...baseProps,
            customHTML: '<div data-testid="species-name">{{species}}</div>',
        };

        render(<TeamPokemon {...props} />);
        expect(screen.getByTestId("species-name").textContent).toContain(
            "Pikachu",
        );
    });

    it("renders custom HTML checkpoints with the wrapping checkpoint class", () => {
        const { container } = render(
            <TeamPokemon
                {...baseProps}
                customHTML='<div data-testid="checkpoint-html">{{checkpoints}}</div>'
                pokemon={{
                    ...Pikachu,
                    checkpoints: [
                        { name: "Boulder Badge", image: "boulder-badge" },
                    ],
                }}
            />,
        );

        const checkpointWrapper = container.querySelector(
            ".pokemon-checkpoints",
        );

        expect(screen.getByTestId("checkpoint-html")).toBeTruthy();
        expect(checkpointWrapper).toBeTruthy();
        expect(checkpointWrapper?.className).toContain("flex");
    });
});
