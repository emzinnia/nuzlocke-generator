import * as React from "react";
import { render, screen } from "@testing-library/react";

import { StatsBase } from "../Stats";
import { generateEmptyPokemon, styleDefaults } from "utils";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: ({ species }: { species: string }) => (
        <span data-testid="pokemon-icon">{species}</span>
    ),
}));

const box = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

describe("<StatsBase /> level cap", () => {
    it("lists non-hidden living Pokemon above the configured level cap", () => {
        render(
            <StatsBase
                box={box}
                color="#eee"
                pokemon={[
                    generateEmptyPokemon([], {
                        id: "1",
                        species: "Pikachu",
                        nickname: "Pika",
                        level: 13,
                        status: "Team",
                    }),
                    generateEmptyPokemon([], {
                        id: "2",
                        species: "Pidgey",
                        level: 5,
                        status: "Team",
                    }),
                    generateEmptyPokemon([], {
                        id: "3",
                        species: "Butterfree",
                        level: 20,
                        status: "Boxed",
                    }),
                    generateEmptyPokemon([], {
                        id: "4",
                        species: "Raticate",
                        level: 30,
                        status: "Dead",
                    }),
                    generateEmptyPokemon([], {
                        id: "5",
                        species: "Mew",
                        level: 100,
                        hidden: true,
                        status: "Team",
                    }),
                ]}
                stats={[]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        levelCap: true,
                        levelCapValue: "12",
                    },
                }}
            />,
        );

        expect(screen.getByText("Level Cap: 12")).toBeTruthy();
        expect(
            screen.getByText("Over Level Cap: Pika (13), Butterfree (20)"),
        ).toBeTruthy();
        expect(screen.queryByText(/Raticate/)).toBeNull();
        expect(screen.queryByText(/Mew/)).toBeNull();
    });

    it("shows no over-level Pokemon when the team is within the cap", () => {
        render(
            <StatsBase
                box={box}
                pokemon={[
                    generateEmptyPokemon([], {
                        id: "1",
                        species: "Pidgey",
                        level: 5,
                        status: "Team",
                    }),
                ]}
                stats={[]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        levelCap: true,
                        levelCapValue: "12",
                    },
                }}
            />,
        );

        expect(screen.getByText("Over Level Cap: None")).toBeTruthy();
    });

    it("renders a not-set message for invalid level caps", () => {
        render(
            <StatsBase
                box={box}
                pokemon={[]}
                stats={[]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        levelCap: true,
                        levelCapValue: "",
                    },
                }}
            />,
        );

        expect(screen.getByText("Level Cap: Not Set")).toBeTruthy();
    });
});
