import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { describe, it, expect } from "vitest";
import { TypeMatchupSummary } from "../TypeMatchupSummary";
import { Types } from "utils";
import { Pokemon } from "models";

const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
    id: `poke-${Math.random().toString(36).slice(2)}`,
    species: "Pikachu",
    status: "Team",
    types: [Types.Electric, Types.Electric],
    ...overrides,
});

const defaultProps = {
    pokemon: [],
    game: { name: "Red" as const, customName: "" },
    customTypes: [],
    style: { editorDarkMode: false } as any,
};

describe("<TypeMatchupSummary />", () => {
    describe("rendering", () => {
        it("renders the Type Matchups heading", () => {
            render(<TypeMatchupSummary {...defaultProps} />);
            expect(screen.getByText("Type Matchups")).toBeDefined();
        });

        it("renders Team Summary and Type Chart tabs", () => {
            render(<TypeMatchupSummary {...defaultProps} />);
            expect(screen.getByRole("tab", { name: "Team Summary" })).toBeDefined();
            expect(screen.getByRole("tab", { name: "Type Chart" })).toBeDefined();
        });

        it("renders generation selector dropdown", () => {
            render(<TypeMatchupSummary {...defaultProps} />);
            expect(screen.getByRole("combobox")).toBeDefined();
            expect(screen.getByText(/Auto \(Gen/)).toBeDefined();
        });

        it("shows empty state message when no team pokemon", () => {
            render(<TypeMatchupSummary {...defaultProps} pokemon={[]} />);
            expect(
                screen.getByText(/No team Pokémon to analyze/),
            ).toBeDefined();
        });

        it("renders Include Ability Effects checkbox", () => {
            render(<TypeMatchupSummary {...defaultProps} />);
            expect(screen.getByLabelText("Include Ability Effects")).toBeDefined();
        });
    });

    describe("team coverage table", () => {
        it("renders team coverage table with pokemon", () => {
            const teamPokemon: Pokemon[] = [
                createMockPokemon({ species: "Pikachu", types: [Types.Electric, Types.Electric] }),
                createMockPokemon({ species: "Charizard", types: [Types.Fire, Types.Flying] }),
            ];

            render(<TypeMatchupSummary {...defaultProps} pokemon={teamPokemon} />);

            expect(screen.getByText("Team Coverage")).toBeDefined();
            expect(screen.getByRole("columnheader", { name: "Type" })).toBeDefined();
            expect(screen.getByRole("columnheader", { name: "Weak" })).toBeDefined();
            expect(screen.getByRole("columnheader", { name: "Resist" })).toBeDefined();
            expect(screen.getByRole("columnheader", { name: "Immune" })).toBeDefined();
            expect(screen.getByRole("columnheader", { name: "Neutral" })).toBeDefined();
        });

        it("displays all pokemon types as rows", () => {
            const teamPokemon: Pokemon[] = [
                createMockPokemon({ types: [Types.Water, Types.Water] }),
            ];

            render(<TypeMatchupSummary {...defaultProps} pokemon={teamPokemon} />);

            // Should have type rows for each type
            expect(screen.getByText("Normal")).toBeDefined();
            expect(screen.getByText("Fire")).toBeDefined();
            expect(screen.getByText("Water")).toBeDefined();
            expect(screen.getByText("Electric")).toBeDefined();
            expect(screen.getByText("Grass")).toBeDefined();
        });

        it("only shows Team status pokemon", () => {
            const pokemon: Pokemon[] = [
                createMockPokemon({ species: "Pikachu", status: "Team", types: [Types.Electric, Types.Electric] }),
                createMockPokemon({ species: "Rattata", status: "Boxed", types: [Types.Normal, Types.Normal] }),
                createMockPokemon({ species: "Gastly", status: "Dead", types: [Types.Ghost, Types.Poison] }),
            ];

            render(<TypeMatchupSummary {...defaultProps} pokemon={pokemon} />);

            // Should still show team coverage since one pokemon is on team
            expect(screen.getByText("Team Coverage")).toBeDefined();
        });
    });

    describe("generation selection", () => {
        it("auto-detects generation based on game", () => {
            render(<TypeMatchupSummary {...defaultProps} game={{ name: "Red", customName: "" }} />);
            expect(screen.getByText(/Auto \(Gen 1\)/)).toBeDefined();
        });

        it("shows correct auto generation for Gen 9 games", () => {
            render(<TypeMatchupSummary {...defaultProps} game={{ name: "Scarlet", customName: "" }} />);
            expect(screen.getByText(/Auto \(Gen 9\)/)).toBeDefined();
        });

        it("allows manual generation selection", () => {
            render(<TypeMatchupSummary {...defaultProps} />);
            const select = screen.getByRole("combobox");

            fireEvent.change(select, { target: { value: "5" } });

            expect((select as HTMLSelectElement).value).toBe("5");
        });

        it("renders all generation options", () => {
            render(<TypeMatchupSummary {...defaultProps} />);

            expect(screen.getByRole("option", { name: /Auto/ })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 1" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 2" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 3" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 4" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 5" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 6" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 7" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 8" })).toBeDefined();
            expect(screen.getByRole("option", { name: "Gen 9" })).toBeDefined();
        });
    });

    describe("type chart tab", () => {
        it("switches to type chart tab when clicked", () => {
            const pokemon: Pokemon[] = [
                createMockPokemon({ types: [Types.Water, Types.Water] }),
            ];

            render(<TypeMatchupSummary {...defaultProps} pokemon={pokemon} />);

            fireEvent.click(screen.getByRole("tab", { name: "Type Chart" }));

            // Type chart shows attacking type vs defending type
            expect(screen.getByText("Atk \\ Def")).toBeDefined();
        });

        it("displays type effectiveness multipliers", () => {
            render(<TypeMatchupSummary {...defaultProps} />);

            fireEvent.click(screen.getByRole("tab", { name: "Type Chart" }));

            // Should show various multipliers
            expect(screen.getAllByText("1×").length).toBeGreaterThan(0);
            expect(screen.getAllByText("2×").length).toBeGreaterThan(0);
            expect(screen.getAllByText("½×").length).toBeGreaterThan(0);
            expect(screen.getAllByText("0×").length).toBeGreaterThan(0);
        });
    });

    describe("swap state and delta indicators", () => {
        it("renders without delta indicators when no swaps", () => {
            const teamPokemon: Pokemon[] = [
                createMockPokemon({ types: [Types.Fire, Types.Fire] }),
            ];

            const { container } = render(
                <TypeMatchupSummary {...defaultProps} pokemon={teamPokemon} />,
            );

            // No delta indicator arrows should be present
            expect(container.textContent).not.toContain("▲");
            expect(container.textContent).not.toContain("▼");
        });

        it("shows delta indicators when pokemon are removed from team", () => {
            const teamPokemon: Pokemon[] = [
                createMockPokemon({ id: "poke-1", species: "Pikachu", types: [Types.Electric, Types.Electric] }),
                createMockPokemon({ id: "poke-2", species: "Charizard", types: [Types.Fire, Types.Flying] }),
            ];

            const removedFromTeam = new Set(["poke-1"]);

            const { container } = render(
                <TypeMatchupSummary
                    {...defaultProps}
                    pokemon={teamPokemon}
                    removedFromTeam={removedFromTeam}
                />,
            );

            // Should have some delta indicators showing changes
            const hasDeltas = container.textContent?.includes("▲") || container.textContent?.includes("▼");
            expect(hasDeltas).toBe(true);
        });

        it("shows delta indicators when pokemon are added to team", () => {
            const allPokemon: Pokemon[] = [
                createMockPokemon({ id: "poke-1", species: "Pikachu", status: "Team", types: [Types.Electric, Types.Electric] }),
                createMockPokemon({ id: "poke-2", species: "Bulbasaur", status: "Boxed", types: [Types.Grass, Types.Poison] }),
            ];

            const addedToTeam = new Set(["poke-2"]);

            const { container } = render(
                <TypeMatchupSummary
                    {...defaultProps}
                    pokemon={allPokemon}
                    addedToTeam={addedToTeam}
                />,
            );

            // Should have some delta indicators
            const hasDeltas = container.textContent?.includes("▲") || container.textContent?.includes("▼");
            expect(hasDeltas).toBe(true);
        });
    });

    describe("ability matchups toggle", () => {
        it("toggles ability matchups checkbox", () => {
            const teamPokemon: Pokemon[] = [
                createMockPokemon({ types: [Types.Ground, Types.Ground], ability: "Levitate" }),
            ];

            render(<TypeMatchupSummary {...defaultProps} pokemon={teamPokemon} />);

            const checkbox = screen.getByLabelText("Include Ability Effects");
            expect((checkbox as HTMLInputElement).checked).toBe(false);

            fireEvent.click(checkbox);
            expect((checkbox as HTMLInputElement).checked).toBe(true);
        });
    });

    describe("text contrast", () => {
        it("uses light text in dark mode", () => {
            const { container } = render(
                <TypeMatchupSummary {...defaultProps} style={{ editorDarkMode: true } as any} />,
            );

            const heading = container.querySelector("h3");
            expect(heading?.closest("div")?.style.color).toBe("rgb(245, 248, 250)");
        });

        it("uses dark text in light mode", () => {
            const { container } = render(
                <TypeMatchupSummary {...defaultProps} style={{ editorDarkMode: false } as any} />,
            );

            const heading = container.querySelector("h3");
            expect(heading?.closest("div")?.style.color).toBe("rgb(24, 32, 38)");
        });
    });
});

