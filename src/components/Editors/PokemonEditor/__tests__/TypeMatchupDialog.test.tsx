import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypeMatchupDialog } from "../TypeMatchupDialog";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Types } from "utils";
import { Pokemon } from "models";

const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
    id: `poke-${Math.random().toString(36).slice(2)}`,
    species: "Pikachu",
    status: "Team",
    types: [Types.Electric, Types.Electric],
    ...overrides,
});

const createMockStore = (overrides: any = {}) => {
    const defaultState = {
        view: {
            dialogs: {
                typeMatchups: true,
            },
        },
        pokemon: [],
        game: { name: "Red", customName: "" },
        style: { editorDarkMode: false },
        customTypes: [],
        ...overrides,
    };

    return configureStore({
        reducer: {
            view: (state = defaultState.view) => state,
            pokemon: (state = defaultState.pokemon) => state,
            game: (state = defaultState.game) => state,
            style: (state = defaultState.style) => state,
            customTypes: (state = defaultState.customTypes) => state,
        },
        preloadedState: defaultState,
    });
};

const renderWithStore = (store: any) => {
    return render(
        <Provider store={store}>
            <TypeMatchupDialog />
        </Provider>,
    );
};

describe("<TypeMatchupDialog />", () => {
    describe("dialog rendering", () => {
        it("renders dialog when isOpen is true", () => {
            const store = createMockStore();
            renderWithStore(store);

            expect(screen.getByText("Type Matchups")).toBeDefined();
        });

        it("does not render dialog when isOpen is false", () => {
            const store = createMockStore({
                view: { dialogs: { typeMatchups: false } },
            });
            renderWithStore(store);

            expect(screen.queryByText("Team Preview")).toBeNull();
        });

        it("renders Team Preview section", () => {
            const store = createMockStore();
            renderWithStore(store);

            expect(screen.getByText("Team Preview")).toBeDefined();
            expect(screen.getByText("Click a Pokémon to swap it out.")).toBeDefined();
        });

        it("renders Other Pokémon section", () => {
            const store = createMockStore();
            renderWithStore(store);

            expect(screen.getByText("Other Pokémon")).toBeDefined();
            expect(screen.getByText("Select a Pokémon to swap it into type matchups.")).toBeDefined();
        });

        it("renders Confirm As Team button", () => {
            const store = createMockStore();
            renderWithStore(store);

            expect(screen.getByText("Confirm As Team")).toBeDefined();
        });

        it("has Confirm As Team button disabled by default", () => {
            const store = createMockStore();
            renderWithStore(store);

            const button = screen.getByText("Confirm As Team").closest("button");
            expect(button?.disabled).toBe(true);
        });
    });

    describe("team pokemon display", () => {
        it("displays team pokemon", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Charizard", status: "Team" }),
                ],
            });
            renderWithStore(store);

            expect(screen.getByText("Pikachu")).toBeDefined();
            expect(screen.getByText("Charizard")).toBeDefined();
        });

        it("displays pokemon nickname if available", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({
                        id: "1",
                        species: "Pikachu",
                        nickname: "Sparky",
                        status: "Team",
                    }),
                ],
            });
            renderWithStore(store);

            expect(screen.getByText("Sparky")).toBeDefined();
        });

        it("does not display hidden pokemon", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team", hidden: true }),
                    createMockPokemon({ id: "2", species: "Charizard", status: "Team" }),
                ],
            });
            renderWithStore(store);

            expect(screen.queryByText("Pikachu")).toBeNull();
            expect(screen.getByText("Charizard")).toBeDefined();
        });

        it("shows warning when team has more than 6 pokemon", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Charizard", status: "Team" }),
                    createMockPokemon({ id: "3", species: "Blastoise", status: "Team" }),
                    createMockPokemon({ id: "4", species: "Venusaur", status: "Team" }),
                    createMockPokemon({ id: "5", species: "Jolteon", status: "Team" }),
                    createMockPokemon({ id: "6", species: "Alakazam", status: "Team" }),
                    createMockPokemon({ id: "7", species: "Gengar", status: "Team" }),
                ],
            });
            renderWithStore(store);

            expect(screen.getByText("Team has more than 6 Pokémon!")).toBeDefined();
        });
    });

    describe("other pokemon display", () => {
        it("displays boxed pokemon in Other section", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Rattata", status: "Boxed" }),
                ],
            });
            renderWithStore(store);

            // Rattata should be in Other Pokémon section
            expect(screen.getByText("Rattata")).toBeDefined();
        });

        it("does not display dead pokemon in Other section", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Rattata", status: "Dead" }),
                ],
            });
            renderWithStore(store);

            expect(screen.queryByText("Rattata")).toBeNull();
        });

        it("shows 'No other Pokémon' when no boxed pokemon exist", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                ],
            });
            renderWithStore(store);

            expect(screen.getByText("No other Pokémon")).toBeDefined();
        });
    });

    describe("swap functionality", () => {
        it("enables Confirm As Team button after removing a pokemon from team", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Rattata", status: "Boxed" }),
                ],
            });
            renderWithStore(store);

            // Click on team pokemon to remove
            const pikachuCard = screen.getByText("Pikachu").closest("[class*='Card']");
            fireEvent.click(pikachuCard!);

            // Button should now be enabled
            const button = screen.getByText("Confirm As Team").closest("button");
            expect(button?.disabled).toBe(false);
        });

        it("enables Confirm As Team button after adding a pokemon to team", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Rattata", status: "Boxed" }),
                ],
            });
            renderWithStore(store);

            // Click on boxed pokemon to add
            const rattataCard = screen.getByText("Rattata").closest("[class*='Card']");
            fireEvent.click(rattataCard!);

            // Button should now be enabled
            const button = screen.getByText("Confirm As Team").closest("button");
            expect(button?.disabled).toBe(false);
        });

        it("moves removed team pokemon to Other section visually", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ id: "1", species: "Pikachu", status: "Team" }),
                    createMockPokemon({ id: "2", species: "Charizard", status: "Team" }),
                ],
            });
            const { container } = renderWithStore(store);

            // Initially both should be in team preview
            const teamPreviewSection = container.querySelector("[class*='typeMatchupsTeamPreview']");
            expect(teamPreviewSection?.textContent).toContain("Pikachu");
            expect(teamPreviewSection?.textContent).toContain("Charizard");

            // Click on Pikachu to remove from team
            const pikachuCard = screen.getByText("Pikachu").closest("[class*='Card']");
            fireEvent.click(pikachuCard!);

            // Now Pikachu should be in Other section
            const otherSection = container.querySelector("[class*='typeMatchupsOther']");
            expect(otherSection?.textContent).toContain("Pikachu");
        });
    });

    describe("dark mode", () => {
        it("applies dark mode styling", () => {
            const store = createMockStore({
                style: { editorDarkMode: true },
            });
            const { baseElement } = renderWithStore(store);

            const dialog = baseElement.querySelector(".bp5-dialog");
            expect(dialog?.classList.contains("bp5-dark")).toBe(true);
        });

        it("uses light text color in dark mode", () => {
            const store = createMockStore({
                style: { editorDarkMode: true },
            });
            const { container } = renderWithStore(store);

            const teamPreview = container.querySelector("[class*='typeMatchupsTeamPreview']") as HTMLElement;
            expect(teamPreview?.style.color).toBe("rgb(245, 248, 250)");
        });
    });

    describe("TypeMatchupSummary integration", () => {
        it("renders TypeMatchupSummary component", () => {
            const store = createMockStore({
                pokemon: [
                    createMockPokemon({ status: "Team", types: [Types.Fire, Types.Fire] }),
                ],
            });
            renderWithStore(store);

            // Should render the team summary tab
            expect(screen.getByRole("tab", { name: "Team Summary" })).toBeDefined();
            expect(screen.getByRole("tab", { name: "Type Chart" })).toBeDefined();
        });
    });
});

