/**
 * GameSelector component tests
 *
 * Note: These tests require @testing-library/react v14+ to run with React 19.
 * The current project version (v10.4.9) is incompatible with React 19's removal
 * of the deprecated ReactDOM.render API. Upgrade @testing-library/react to fix.
 */
import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { GameSelector } from "../GameSelector";

describe("<GameSelector />", () => {
    const defaultProps = {
        selectedGame: null,
        onGameSelect: vi.fn(),
        onStartGame: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the trigger button with correct text", () => {
        render(<GameSelector {...defaultProps} />);

        expect(screen.getByText("Start New Run")).toBeTruthy();
        expect(screen.getByText("Choose a game to begin tracking")).toBeTruthy();
    });

    it("is collapsed by default", () => {
        render(<GameSelector {...defaultProps} />);

        expect(screen.queryByText("All")).toBeNull();
    });

    it("expands when clicking the trigger button", () => {
        render(<GameSelector {...defaultProps} />);

        const trigger = screen.getByRole("button", { name: /Start New Run/i });
        fireEvent.click(trigger);

        expect(screen.getByText("All")).toBeTruthy();
        expect(screen.getByText("I")).toBeTruthy();
        expect(screen.getByText("II")).toBeTruthy();
    });

    it("shows all generation filter tabs when expanded", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));

        const expectedTabs = ["All", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "Other"];
        expectedTabs.forEach((tab) => {
            expect(screen.getByRole("button", { name: tab })).toBeTruthy();
        });
    });

    it("shows game buttons when expanded", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));

        expect(screen.getByRole("button", { name: "Red" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Blue" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Emerald" })).toBeTruthy();
    });

    it("calls onGameSelect when clicking a game", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: "Red" }));

        expect(defaultProps.onGameSelect).toHaveBeenCalledWith("Red");
        expect(defaultProps.onGameSelect).toHaveBeenCalledTimes(1);
    });

    it("filters games when clicking a generation tab", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: "I" }));

        expect(screen.getByRole("button", { name: "Red" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Blue" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Yellow" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Emerald" })).toBeNull();
    });

    it("shows Gen III games when filtering by Gen III", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: "III" }));

        expect(screen.getByRole("button", { name: "Ruby" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Sapphire" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Emerald" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "FireRed" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "LeafGreen" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Red" })).toBeNull();
    });

    it("does not show start button when no game is selected", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));

        expect(screen.queryByRole("button", { name: /^Start / })).toBeNull();
    });

    it("shows start button with game name when a game is selected", () => {
        render(<GameSelector {...defaultProps} selectedGame="Emerald" />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));

        expect(screen.getByRole("button", { name: /Start Emerald/ })).toBeTruthy();
    });

    it("calls onStartGame when clicking the start button", () => {
        render(<GameSelector {...defaultProps} selectedGame="Emerald" />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: /Start Emerald/ }));

        expect(defaultProps.onStartGame).toHaveBeenCalledTimes(1);
    });

    it("shows the selected game badge in the trigger when a game is selected", () => {
        render(<GameSelector {...defaultProps} selectedGame="FireRed" />);

        expect(screen.getByText("FireRed")).toBeTruthy();
    });

    it("collapses when clicking the trigger button again", () => {
        render(<GameSelector {...defaultProps} />);

        const trigger = screen.getByRole("button", { name: /Start New Run/i });
        fireEvent.click(trigger);
        expect(screen.getByText("All")).toBeTruthy();

        fireEvent.click(trigger);
        expect(screen.queryByRole("button", { name: "All" })).toBeNull();
    });

    it("shows Other category with Custom game", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: "Other" }));

        expect(screen.getByRole("button", { name: "Custom" })).toBeTruthy();
    });

    it("shows Gen IX games", () => {
        render(<GameSelector {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /Start New Run/i }));
        fireEvent.click(screen.getByRole("button", { name: "IX" }));

        expect(screen.getByRole("button", { name: "Scarlet" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Violet" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Legends: Z-A" })).toBeTruthy();
    });
});

