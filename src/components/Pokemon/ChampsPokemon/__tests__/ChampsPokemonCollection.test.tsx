/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { render } from "@testing-library/react";
import { ChampsPokemonView } from "../ChampsPokemonCollection";

vi.mock("../ChampsPokemon", () => ({
    ChampsPokemon: ({ nickname }: any) => (
        <div data-testid={`champ-${nickname}`}>{nickname}</div>
    ),
}));

vi.mock("components/Layout/Layout/Layout", () => ({
    Layout: ({ children }: any) => <div data-testid="layout">{children}</div>,
    LayoutDisplay: { Inline: "inline" },
    LayoutDirection: { Row: "row" },
    LayoutAlignment: { Center: "center" },
    LayoutSpacing: { Center: "center" },
}));

describe("<ChampsPokemonView />", () => {
    it("renders champs inside layout", () => {
        const pokemon = [
            { id: "1", nickname: "A", species: "A" },
            { id: "2", nickname: "B", species: "B" },
        ] as any;

        const { getByTestId } = render(<ChampsPokemonView pokemon={pokemon} />);

        expect(getByTestId("layout").children).toHaveLength(2);
    });
});

