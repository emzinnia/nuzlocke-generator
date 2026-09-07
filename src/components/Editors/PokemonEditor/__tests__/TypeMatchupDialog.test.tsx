import * as React from "react";
import { render, screen, fireEvent, waitFor } from "utils/testUtils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TypeMatchupDialog } from "../TypeMatchupDialog";
import { store } from "store";
import { replaceState, toggleDialog } from "actions";
import { State } from "state";
import { generateEmptyPokemon } from "utils";

describe("<TypeMatchupDialog />", () => {
    beforeEach(() => {
        // Open the dialog before each test
        store.dispatch(toggleDialog("typeMatchups"));
    });

    afterEach(() => {
        // Close the dialog after each test (if it's still open)
        const state = store.getState() as State;
        if (state.view?.dialogs?.typeMatchups) {
            store.dispatch(toggleDialog("typeMatchups"));
        }
    });

    describe("dialog rendering", () => {
        it("renders dialog when opened via dispatch", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("Team Preview")).toBeDefined();
            });
        });

        it("renders Other Pokémon section", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("Other Pokémon")).toBeDefined();
            });
        });

        it("renders Confirm As Team button", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("Confirm As Team")).toBeDefined();
            });
        });

        it("has Confirm As Team button disabled by default", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                const button = screen.getByText("Confirm As Team").closest("button");
                expect(button?.disabled).toBe(true);
            });
        });

        it("renders Type Matchups title in dialog header", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                // The dialog has "Type Matchups" as its title
                const dialogTitle = screen.getAllByText("Type Matchups");
                expect(dialogTitle.length).toBeGreaterThan(0);
            });
        });

        it("renders swap instruction text", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("Click a Pokémon to swap it out.")).toBeDefined();
            });
        });

        it("renders TypeMatchupSummary tabs", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByRole("tab", { name: "Team Summary" })).toBeDefined();
                expect(screen.getByRole("tab", { name: "Type Chart" })).toBeDefined();
            });
        });
    });

    describe("closed dialog state", () => {
        beforeEach(() => {
            // Close the dialog for this test suite
            const state = store.getState() as State;
            if (state.view?.dialogs?.typeMatchups) {
                store.dispatch(toggleDialog("typeMatchups"));
            }
        });

        it("does not render dialog content when closed", () => {
            render(<TypeMatchupDialog />);
            // Dialog is closed, so Team Preview should not be visible
            expect(screen.queryByText("Team Preview")).toBeNull();
        });
    });

    describe("Confirm As Team status updates", () => {
        const teamMon = generateEmptyPokemon(undefined, {
            id: "team-pikachu",
            species: "Pikachu",
            nickname: "TeamPikachu",
            status: "Team",
        });
        const daycareMon = generateEmptyPokemon(undefined, {
            id: "daycare-eevee",
            species: "Eevee",
            nickname: "DaycareEevee",
            status: "Daycare",
        });
        const boxedMon = generateEmptyPokemon(undefined, {
            id: "boxed-magikarp",
            species: "Magikarp",
            nickname: "BoxedMagikarp",
            status: "Boxed",
        });
        let previousPokemon: State["pokemon"];

        beforeEach(() => {
            previousPokemon = (store.getState() as State).pokemon;
            store.dispatch(
                replaceState({
                    ...(store.getState() as State),
                    pokemon: [teamMon, daycareMon, boxedMon],
                }),
            );
        });

        afterEach(() => {
            store.dispatch(
                replaceState({
                    ...(store.getState() as State),
                    pokemon: previousPokemon,
                }),
            );
        });

        const statusOf = (id: string) =>
            (store.getState() as State).pokemon.find((poke) => poke.id === id)?.status;

        it("does not box a custom-box Pokémon after a cancelled preview", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("DaycareEevee")).toBeDefined();
            });

            fireEvent.click(screen.getByText("DaycareEevee"));
            await waitFor(() => {
                expect(
                    screen.getByText("Confirm As Team").closest("button")?.disabled,
                ).toBe(false);
            });

            fireEvent.click(screen.getByText("DaycareEevee"));
            await waitFor(() => {
                expect(
                    screen.getByText("Confirm As Team").closest("button")?.disabled,
                ).toBe(true);
            });

            fireEvent.click(screen.getByText("Confirm As Team"));

            expect(statusOf("daycare-eevee")).toBe("Daycare");
            expect(statusOf("team-pikachu")).toBe("Team");
            expect(statusOf("boxed-magikarp")).toBe("Boxed");
        });

        it("keeps cancelled preview Pokémon in their original box when confirming a different add", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("DaycareEevee")).toBeDefined();
            });

            fireEvent.click(screen.getByText("DaycareEevee"));
            await waitFor(() => {
                expect(screen.getByText("DaycareEevee")).toBeDefined();
            });
            fireEvent.click(screen.getByText("DaycareEevee"));

            fireEvent.click(screen.getByText("BoxedMagikarp"));
            await waitFor(() => {
                expect(
                    screen.getByText("Confirm As Team").closest("button")?.disabled,
                ).toBe(false);
            });

            fireEvent.click(screen.getByText("Confirm As Team"));

            expect(statusOf("daycare-eevee")).toBe("Daycare");
            expect(statusOf("boxed-magikarp")).toBe("Team");
            expect(statusOf("team-pikachu")).toBe("Team");
        });

        it("still boxes a real team member that was swapped out", async () => {
            render(<TypeMatchupDialog />);

            await waitFor(() => {
                expect(screen.getByText("TeamPikachu")).toBeDefined();
            });

            fireEvent.click(screen.getByText("TeamPikachu"));
            fireEvent.click(screen.getByText("BoxedMagikarp"));
            await waitFor(() => {
                expect(
                    screen.getByText("Confirm As Team").closest("button")?.disabled,
                ).toBe(false);
            });

            fireEvent.click(screen.getByText("Confirm As Team"));

            expect(statusOf("team-pikachu")).toBe("Boxed");
            expect(statusOf("boxed-magikarp")).toBe("Team");
            expect(statusOf("daycare-eevee")).toBe("Daycare");
        });
    });
});
