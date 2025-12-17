import { vi } from "vitest";

vi.mock("utils", async () => {
    const actual = await vi.importActual<typeof import("utils")>("utils");
    return {
        ...actual,
        getPokemonImage: vi.fn().mockResolvedValue("mock-pokemon-image"),
    };
});

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({ children }) => (
        <div data-testid="pokemon-image">
            {typeof children === "function" ? children("mock-image") : null}
        </div>
    ),
}));

vi.mock("../Moves", () => ({
    Moves: ({ moves }) => (
        <div data-testid="moves">{moves?.join(",") ?? ""}</div>
    ),
}));

vi.mock("../PokemonItem", () => ({
    PokemonItem: () => <div data-testid="pokemon-item" />,
}));

vi.mock("../PokemonPokeball", () => ({
    PokemonPokeball: () => <div data-testid="pokemon-pokeball" />,
}));

vi.mock("../PokemonFriendship", () => ({
    PokemonFriendship: ({ friendship }) => (
        <div data-testid="pokemon-friendship">{friendship}</div>
    ),
}));

vi.mock("../getMetLocationString", () => ({
    getMetLocationString: () => "Met at Pallet Town",
}));

vi.mock("components/Features/Result/TrainerResult", () => ({
    CheckpointsDisplay: ({ className }) => (
        <div data-testid="checkpoints-display" className={className}>
            Checkpoints
        </div>
    ),
}));

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: (props: { className?: string }) => (
        <div data-testid="pokemon-icon" className={props.className} />
    ),
}));

import * as React from "react";
import { fireEvent, render, screen } from "utils/testUtils";
import { styleDefaults } from "utils/styleDefaults";
import { Generation, Types } from "utils";
import { Editor, Game, Pokemon } from "models";
import { TeamPokemonBase, TeamPokemonInfo } from "../TeamPokemon";

const baseStyle = { ...styleDefaults };
const baseGame: Game = { name: "Red" as any, customName: "" };
const baseEditor: Editor = { minimized: false };

const basePokemon: Pokemon = {
    id: "poke-1",
    species: "Bulbasaur",
    nickname: "Bulby",
    level: 10,
    types: [Types.Grass, Types.Poison],
    ability: "Overgrow",
    moves: ["Tackle", "Growl"],
};

describe("TeamPokemonBase", () => {
    it("renders nickname, species, and level", () => {
        render(
            <TeamPokemonBase
                pokemon={basePokemon}
                style={baseStyle}
                game={baseGame}
                selectPokemon={vi.fn()}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        expect(screen.getByText("Bulby")).toBeTruthy();
        expect(screen.getByText("Bulbasaur")).toBeTruthy();
        expect(screen.getByText(/lv\. 10/i)).toBeTruthy();
    });

    it("invokes selectPokemon when the image wrapper is clicked", () => {
        const selectPokemon = vi.fn();

        render(
            <TeamPokemonBase
                pokemon={basePokemon}
                style={baseStyle}
                game={baseGame}
                selectPokemon={selectPokemon}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        fireEvent.click(screen.getByRole("presentation"));
        expect(selectPokemon).toHaveBeenCalledWith(basePokemon.id);
    });

    it("shows MVP label when pokemon is marked as MVP", () => {
        render(
            <TeamPokemonBase
                pokemon={{ ...basePokemon, mvp: true }}
                style={baseStyle}
                game={baseGame}
                selectPokemon={vi.fn()}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        expect(screen.getByText("MVP")).toBeTruthy();
    });

    it("renders linked pokemon information", () => {
        const linked = { ...basePokemon, nickname: "Partner" };

        render(
            <TeamPokemonBase
                pokemon={basePokemon}
                linkedPokemon={linked}
                style={baseStyle}
                game={baseGame}
                selectPokemon={vi.fn()}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        expect(screen.getByText(/Linked To\s+Partner/i)).toBeTruthy();
        expect(screen.getByTestId("pokemon-icon")).toBeTruthy();
    });

    it("renders tera and alpha indicators when provided", () => {
        render(
            <TeamPokemonBase
                pokemon={{
                    ...basePokemon,
                    teraType: Types.Fire,
                    alpha: true,
                }}
                style={baseStyle}
                game={baseGame}
                selectPokemon={vi.fn()}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        expect(screen.getByAltText("alpha")).toBeTruthy();
        expect(screen.getByAltText("Tera: Fire")).toBeTruthy();
    });

    it("uses minimal layout when enabled", () => {
        const minimalStyle = { ...baseStyle, minimalTeamLayout: true };

        render(
            <TeamPokemonBase
                pokemon={basePokemon}
                style={minimalStyle}
                game={baseGame}
                selectPokemon={vi.fn()}
                editor={baseEditor}
                customTypes={[]}
            />,
        );

        const wrapper = screen.getByRole("presentation").parentElement;
        expect(wrapper?.className ?? "").toContain("pokemon-container");
        expect(wrapper?.className ?? "").toContain("minimal");
        expect(screen.queryByTestId("moves")).toBeNull();
    });
});

describe("TeamPokemonInfo", () => {
    it("renders moves when enabled", () => {
        render(
            <TeamPokemonInfo
                generation={Generation.Gen3}
                style={baseStyle}
                pokemon={basePokemon}
                customTypes={[]}
                linkedPokemon={undefined}
                game={baseGame}
            />,
        );

        expect(screen.getByTestId("moves")).toBeTruthy();
    });

    it("omits moves when disabled", () => {
        const styleWithoutMoves = { ...baseStyle, showPokemonMoves: false };

        render(
            <TeamPokemonInfo
                generation={Generation.Gen3}
                style={styleWithoutMoves}
                pokemon={basePokemon}
                customTypes={[]}
                linkedPokemon={undefined}
                game={baseGame}
            />,
        );

        expect(screen.queryByTestId("moves")).toBeNull();
    });

    it("shows Gen 1 special stat label", () => {
        const pokemonWithStats: Pokemon = {
            ...basePokemon,
            extraData: {
                currentHp: 10,
                attack: 20,
                defense: 30,
                special: 40,
                speed: 50,
            },
        };

        render(
            <TeamPokemonInfo
                generation={Generation.Gen1}
                style={baseStyle}
                pokemon={pokemonWithStats}
                customTypes={[]}
                linkedPokemon={undefined}
                game={baseGame}
            />,
        );

        expect(screen.getByText("SPC")).toBeTruthy();
        expect(screen.queryByText("SPATK")).toBeNull();
    });

    it("shows split special stats for later generations", () => {
        const pokemonWithSplitStats: Pokemon = {
            ...basePokemon,
            extraData: {
                currentHp: 10,
                attack: 20,
                defense: 30,
                specialAttack: 40,
                specialDefense: 50,
                speed: 60,
            },
        };

        render(
            <TeamPokemonInfo
                generation={Generation.Gen3}
                style={baseStyle}
                pokemon={pokemonWithSplitStats}
                customTypes={[]}
                linkedPokemon={undefined}
                game={baseGame}
            />,
        );

        expect(screen.getByText("SPATK")).toBeTruthy();
        expect(screen.getByText("SPDEF")).toBeTruthy();
    });
});

