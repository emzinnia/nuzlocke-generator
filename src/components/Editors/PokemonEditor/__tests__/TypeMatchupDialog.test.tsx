import * as React from "react";
import { render, screen, fireEvent, waitFor } from "utils/testUtils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TypeMatchupDialog } from "../TypeMatchupDialog";
import { store } from "store";
import { toggleDialog } from "actions";

describe("<TypeMatchupDialog />", () => {
    beforeEach(() => {
        // Open the dialog before each test
        store.dispatch(toggleDialog("typeMatchups") as any);
    });

    afterEach(() => {
        // Close the dialog after each test (if it's still open)
        const state = store.getState() as any;
        if (state.view?.dialogs?.typeMatchups) {
            store.dispatch(toggleDialog("typeMatchups") as any);
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
            const state = store.getState() as any;
            if (state.view?.dialogs?.typeMatchups) {
                store.dispatch(toggleDialog("typeMatchups") as any);
            }
        });

        it("does not render dialog content when closed", () => {
            render(<TypeMatchupDialog />);
            // Dialog is closed, so Team Preview should not be visible
            expect(screen.queryByText("Team Preview")).toBeNull();
        });
    });
});
