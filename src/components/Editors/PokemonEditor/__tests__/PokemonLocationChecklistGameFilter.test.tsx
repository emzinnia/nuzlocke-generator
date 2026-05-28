import * as React from "react";
import { fireEvent, render, screen, within } from "utils/testUtils";
import { describe, expect, it, vi } from "vitest";
import { Pokemon } from "models";
import { styleDefaults, Types } from "utils";
import { PokemonLocationChecklist } from "../PokemonLocationChecklist";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: (props: Pokemon) => (
        <span data-testid={`pokemon-icon-${props.species.toLowerCase()}`}>
            {props.nickname || props.species}
        </span>
    ),
}));

const boxes = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
];

const defaultProps = {
    game: { name: "SoulSilver" as const, customName: "" },
    style: { ...styleDefaults, editorDarkMode: false },
    boxes,
    excludedAreas: [],
    customAreas: [],
};

const createPokemon = (overrides: Partial<Pokemon>): Pokemon => ({
    id: `poke-${overrides.species}-${overrides.met}`,
    species: "Pidgey",
    status: "Boxed",
    met: "Route 29",
    types: [Types.Normal, Types.Flying],
    ...overrides,
});

const locationRow = (location: string) => {
    const row = screen.getByText(location).parentElement;
    if (!row) throw new Error(`Unable to find row for ${location}`);
    return row;
};

describe("<PokemonLocationChecklist /> game filter", () => {
    it("includes legacy current-run pokemon when filtering to the active game", () => {
        render(
            <PokemonLocationChecklist
                {...defaultProps}
                pokemon={[
                    createPokemon({
                        species: "Pidgey",
                        nickname: "Patrick",
                        status: "Dead",
                        met: "Route 29",
                        gameOfOrigin: "None",
                    }),
                    createPokemon({
                        species: "Zubat",
                        status: "Got Away",
                        met: "Slowpoke Well",
                        gameOfOrigin: "None",
                        hidden: true,
                        types: [Types.Poison, Types.Flying],
                    }),
                ]}
            />,
        );

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "SoulSilver" },
        });

        expect(
            within(locationRow("Route 29")).getByTestId("pokemon-icon-pidgey"),
        ).toBeDefined();
        expect(
            within(locationRow("Slowpoke Well")).getByTestId(
                "pokemon-icon-zubat",
            ),
        ).toBeDefined();
    });

    it("defaults to the active game and excludes pokemon from explicit other games", () => {
        render(
            <PokemonLocationChecklist
                {...defaultProps}
                pokemon={[
                    createPokemon({
                        species: "Pidgey",
                        met: "Route 30",
                        gameOfOrigin: "HeartGold",
                    }),
                ]}
            />,
        );

        expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
            "SoulSilver",
        );

        expect(
            within(locationRow("Route 30")).queryByTestId(
                "pokemon-icon-pidgey",
            ),
        ).toBeNull();
    });
});
