import * as React from "react";
import { render, screen, within } from "utils/testUtils";
import { vi } from "vitest";
import { PokemonLocationChecklist } from "../PokemonLocationChecklist";
import { Pokemon } from "models";
import { styleDefaults, Types } from "utils";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: ({ species }: { species?: string }) => (
        <span data-testid="location-pokemon-icon">{species}</span>
    ),
}));

const defaultBoxes = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

describe("<PokemonLocationChecklist />", () => {
    it("marks Meteor Falls encounters as found for Omega Ruby", () => {
        const pokemon: Pokemon[] = [
            {
                id: "solrock-1",
                position: 0,
                species: "Solrock",
                nickname: "Neda",
                status: "Team",
                gender: "genderless",
                met: "Meteor Falls",
                nature: "Hasty",
                ability: "Levitate",
                types: [Types.Rock, Types.Psychic],
                egg: false,
                gameOfOrigin: "OmegaRuby",
            },
        ];

        render(
            <PokemonLocationChecklist
                pokemon={pokemon}
                game={{ name: "OmegaRuby", customName: "" }}
                style={styleDefaults}
                boxes={defaultBoxes}
                excludedAreas={[]}
                customAreas={[]}
            />,
        );

        const meteorFalls = screen.getByText("Meteor Falls").parentElement;
        expect(meteorFalls).not.toBeNull();
        expect(
            within(meteorFalls as HTMLElement).getByTestId(
                "location-pokemon-icon",
            ).textContent,
        ).toBe("Solrock");
    });
});
