/**
 * EmptyStateView component tests
 *
 * Note: These tests require @testing-library/react v14+ to run with React 19.
 * The current project version (v10.4.9) is incompatible with React 19's removal
 * of the deprecated ReactDOM.render API. Upgrade @testing-library/react to fix.
 */
import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { EmptyStateView } from "../EmptyStateView";

vi.mock("components/Common/ui/GameSelector", () => ({
    GameSelector: ({ selectedGame, onGameSelect, onStartGame }: any) => (
        <div data-testid="game-selector">
            <span data-testid="selected-game">{selectedGame || "none"}</span>
            <button
                data-testid="select-emerald"
                onClick={() => onGameSelect("Emerald")}
            >
                Select Emerald
            </button>
            <button data-testid="start-game" onClick={onStartGame}>
                Start Game
            </button>
        </div>
    ),
}));

vi.mock("components/Common/Shared/appToaster", () => ({
    showToast: vi.fn(),
}));

vi.mock("assets/pokeball.png", () => ({
    default: "pokeball.png",
}));

describe("<EmptyStateView />", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the main heading", () => {
        render(<EmptyStateView />);

        expect(screen.getByText("Nuzlocke Generator")).toBeTruthy();
    });

    it("renders the description text", () => {
        render(<EmptyStateView />);

        expect(
            screen.getByText(
                "Track your Nuzlocke run, manage your team, and generate shareable images",
            ),
        ).toBeTruthy();
    });

    it("renders the version badge", () => {
        render(<EmptyStateView />);

        expect(screen.getByText("v2")).toBeTruthy();
    });

    it("renders the Import from JSON action card", () => {
        render(<EmptyStateView />);

        expect(screen.getByText("Import from JSON")).toBeTruthy();
        expect(screen.getByText("Load a previously exported run")).toBeTruthy();
    });

    it("renders the Import from Save File action card", () => {
        render(<EmptyStateView />);

        expect(screen.getByText("Import from Save File")).toBeTruthy();
        expect(
            screen.getByText("Extract data from .sav files (Gen 1-3)"),
        ).toBeTruthy();
    });

    it("renders the GameSelector component", () => {
        render(<EmptyStateView />);

        expect(screen.getByTestId("game-selector")).toBeTruthy();
    });

    it("renders the footer text about local storage", () => {
        render(<EmptyStateView />);

        expect(
            screen.getByText("Your progress is saved locally in your browser"),
        ).toBeTruthy();
    });

    it("renders hidden file inputs for JSON and SAV imports", () => {
        render(<EmptyStateView />);

        const inputs = document.querySelectorAll('input[type="file"]');
        expect(inputs.length).toBe(2);

        const jsonInput = document.querySelector('input[accept=".json"]');
        const savInput = document.querySelector('input[accept=".sav"]');
        expect(jsonInput).toBeTruthy();
        expect(savInput).toBeTruthy();
    });

    it("triggers file input click when clicking Import from JSON", () => {
        render(<EmptyStateView />);

        const jsonInput = document.querySelector(
            'input[accept=".json"]',
        ) as HTMLInputElement;
        const clickSpy = vi.spyOn(jsonInput, "click");

        const importButton = screen.getByText("Import from JSON");
        fireEvent.click(importButton.closest("button")!);

        expect(clickSpy).toHaveBeenCalled();
    });

    it("shows toast when clicking Import from Save File", async () => {
        const { showToast } = await import(
            "components/Common/Shared/appToaster"
        );
        render(<EmptyStateView />);

        const saveButton = screen.getByText("Import from Save File");
        fireEvent.click(saveButton.closest("button")!);

        expect(showToast).toHaveBeenCalledWith({
            message:
                "For save file import, use the Data panel in the editor sidebar",
            intent: expect.any(String),
        });
    });

    it("updates selected game when GameSelector fires onGameSelect", () => {
        render(<EmptyStateView />);

        expect(screen.getByTestId("selected-game").textContent).toBe("none");

        fireEvent.click(screen.getByTestId("select-emerald"));

        expect(screen.getByTestId("selected-game").textContent).toBe("Emerald");
    });

    it("renders the pokeball image", () => {
        render(<EmptyStateView />);

        const pokeballImg = document.querySelector('img[src="pokeball.png"]');
        expect(pokeballImg).toBeTruthy();
    });
});

describe("<EmptyStateView /> JSON Import", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("handles valid JSON file import", async () => {
        const { showToast } = await import(
            "components/Common/Shared/appToaster"
        );
        render(<EmptyStateView />);

        const jsonInput = document.querySelector(
            'input[accept=".json"]',
        ) as HTMLInputElement;

        const validJson = JSON.stringify({
            game: { name: "Emerald" },
            pokemon: [],
        });

        const file = new File([validJson], "nuzlocke.json", {
            type: "application/json",
        });

        Object.defineProperty(jsonInput, "files", {
            value: [file],
            writable: false,
        });

        await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve();
            reader.readAsText(file);
        });

        fireEvent.change(jsonInput);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(showToast).toHaveBeenCalled();
    });
});

