import * as React from "react";
import { render, screen } from "@testing-library/react";

import { StatsBase } from "../Stats";
import { styleDefaults } from "utils";
import { Box, Pokemon } from "models";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: ({ species, id }: any) => (
        <span data-testid={`icon-${species}-${id}`} />
    ),
}));

vi.mock("components/Layout/Layout/Layout", () => ({
    Layout: ({ children }: any) => <div>{children}</div>,
    LayoutDisplay: { Inline: "inline" },
}));

const pokemon: Pokemon[] = [
    {
        id: "c1",
        species: "Alpha",
        status: "Champs",
        level: 10,
        types: ["Fire", "Fire"] as any,
    } as Pokemon,
    {
        id: "d1",
        species: "Bravo",
        status: "Dead",
        level: 20,
        causeOfDeath: "Crit",
        types: ["Water", "Flying"] as any,
        shiny: true,
    } as Pokemon,
    {
        id: "t1",
        species: "Charlie",
        status: "Team",
        level: 30,
        types: ["Water", "Water"] as any,
    } as Pokemon,
];

const box: Box[] = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

describe("<StatsBase />", () => {
    it("displays averages, type/killer summaries, shinies, and custom stats", () => {
        render(
            <StatsBase
                pokemon={pokemon}
                status="Champs"
                box={box}
                stats={[{ id: "s1", key: "Playtime", value: "5h" } as any]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        averageLevel: true,
                        averageLevelDetailed: true,
                        mostCommonKillers: true,
                        mostCommonTypes: true,
                        shiniesCaught: true,
                    },
                }}
            />,
        );

        expect(screen.getByText(/Average Level: 20/, { exact: false })).toBeTruthy();
        expect(screen.getByText(/Champs \(10\)/)).toBeTruthy();
        expect(screen.getByText(/Most Common Killers: Crit/)).toBeTruthy();
        expect(screen.getByText(/Most Common Types: Water \(2 Pokémon\)/)).toBeTruthy();
        expect(screen.getByText("Shinies:")).toBeTruthy();
        expect(screen.getByTestId("icon-Bravo-d1")).toBeTruthy();
        expect(screen.getByText(/Playtime: 5h/)).toBeTruthy();
    });
});

