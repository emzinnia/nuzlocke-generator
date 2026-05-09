import * as React from "react";
import { render, screen } from "@testing-library/react";

import { ResultBase, BackspriteMontage } from "../Result";
import { styleDefaults, generateEmptyPokemon } from "utils";
import { Editor, Box, Pokemon } from "models";

type ResultBaseProps = React.ComponentProps<typeof ResultBase>;
type PokemonSpeciesProps = { species: string };
type PokemonProp = { pokemon: Pokemon };
type ChildrenProps = { children?: React.ReactNode };

vi.mock("components/Pokemon/TeamPokemon/TeamPokemon", () => ({
    TeamPokemon: ({ pokemon }: PokemonProp) => (
        <div data-testid={`team-${pokemon.species}`}>{pokemon.species}</div>
    ),
}));

vi.mock("components/Pokemon/BoxedPokemon/BoxedPokemon", () => ({
    BoxedPokemon: ({ species }: PokemonSpeciesProps) => (
        <div data-testid={`boxed-${species}`}>{species}</div>
    ),
}));

vi.mock("components/Pokemon/DeadPokemon/DeadPokemon", () => ({
    DeadPokemon: ({ species }: PokemonSpeciesProps) => (
        <div data-testid={`dead-${species}`}>{species}</div>
    ),
}));

vi.mock("components/Pokemon/ChampsPokemon/ChampsPokemon", () => ({
    ChampsPokemon: ({ species }: PokemonSpeciesProps) => (
        <div data-testid={`champs-${species}`}>{species}</div>
    ),
}));

vi.mock("components/Features/Result/TrainerResult", () => ({
    TrainerResult: () => <div data-testid="trainer-result" />,
}));

vi.mock("components/Layout/TopBar/TopBar", () => ({
    TopBar: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="top-bar">{children}</div>
    ),
}));

vi.mock("components/Common/Shared", () => ({
    ErrorBoundary: ({ children }: ChildrenProps) => <>{children}</>,
}));

vi.mock("components/Editors/PokemonEditor", () => ({
    TypeMatchupDialog: () => <div data-testid="type-matchup-dialog" />,
}));

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({
        children,
    }: {
        children: (url: string) => React.ReactNode;
    }) => <>{children("https://img.test")}</>,
}));

vi.mock("components/ui/shims", () => ({
    Select: ({ children }: ChildrenProps) => <div data-testid="zoom-select">{children}</div>,
    Button: ({ children }: ChildrenProps) => <button>{children}</button>,
    Classes: {},
    MenuItem: () => null,
}));

vi.mock("is-mobile", () => ({ default: () => false }));

const baseEditor: Editor = {
    minimized: false,
    showResultInMobile: false,
};

const boxes: Box[] = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

const createPokemon = () => [
    generateEmptyPokemon([], { id: "team-1", species: "Alpha", status: "Team" }),
    generateEmptyPokemon([], { id: "boxed-1", species: "Boxy", status: "Boxed" }),
    generateEmptyPokemon([], {
        id: "dead-1",
        species: "Ghost",
        status: "Dead",
        causeOfDeath: "Crit",
    }),
    generateEmptyPokemon([], { id: "champ-1", species: "Victor", status: "Champs" }),
];

describe("<ResultBase />", () => {
    it("renders team and status sections with rules", () => {
        render(
            <ResultBase
                pokemon={createPokemon()}
                game={{ name: "Red", customName: "" }}
                trainer={{ notes: "Remember to heal", badges: [] }}
                box={boxes}
                editor={baseEditor}
                selectPokemon={vi.fn() as unknown as ResultBaseProps["selectPokemon"]}
                toggleMobileResultView={
                    vi.fn() as unknown as ResultBaseProps["toggleMobileResultView"]
                }
                toggleDialog={vi.fn() as unknown as ResultBaseProps["toggleDialog"]}
                style={{
                    ...styleDefaults,
                    displayRules: true,
                    displayRulesLocation: "top",
                    trainerSectionOrientation: "horizontal",
                }}
                rules={["Rule 1", "Rule 2"]}
                customTypes={[]}
            />,
        );

        expect(screen.getByText("Rule 1")).toBeTruthy();
        expect(screen.getByTestId("team-Alpha")).toBeTruthy();
        expect(screen.getByText("Boxed")).toBeTruthy();
        expect(screen.getByText(/Dead/)).toBeTruthy();
        expect(screen.getByText(/Champs/)).toBeTruthy();
    });
});

describe("<BackspriteMontage />", () => {
    it("renders one sprite per Pokémon", () => {
        const pokemon = [
            generateEmptyPokemon([], { id: "1", species: "Pikachu" }),
            generateEmptyPokemon([], { id: "2", species: "Bulbasaur" }),
        ];

        render(<BackspriteMontage pokemon={pokemon} />);

        const sprites = screen.getAllByRole("presentation");
        expect(sprites).toHaveLength(2);
        expect(sprites[0].getAttribute("data-sprite-species")).toBe("Pikachu");
    });
});
