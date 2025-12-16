import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RulesEditor, RulesEditorDialogBase, presetRules } from "../RulesEditor";

describe("presetRules", () => {
    it("contains expected rulesets", () => {
        const presetNames = presetRules.map((p) => p.name);
        expect(presetNames).toContain("Classic Nuzlocke");
        expect(presetNames).toContain("Hardcore Nuzlocke");
        expect(presetNames).toContain("Randomizer-Friendly");
        expect(presetNames).toContain("Custom / House Rules");
    });

    it("has description for each ruleset", () => {
        presetRules.forEach((preset) => {
            expect(preset.description).toBeDefined();
            expect(preset.description.length).toBeGreaterThan(0);
        });
    });

    it("has rules array for each ruleset", () => {
        presetRules.forEach((preset) => {
            expect(Array.isArray(preset.rules)).toBe(true);
            expect(preset.rules.length).toBeGreaterThan(0);
        });
    });

    it("Classic Nuzlocke has the core three rules", () => {
        const classic = presetRules.find((p) => p.name === "Classic Nuzlocke");
        expect(classic).toBeDefined();
        expect(classic!.rules.length).toBe(3);
        expect(classic!.rules[0]).toContain("faints");
        expect(classic!.rules[1]).toContain("first");
        expect(classic!.rules[2]).toContain("nicknamed");
    });

    it("Hardcore Nuzlocke has additional restrictions", () => {
        const hardcore = presetRules.find((p) => p.name === "Hardcore Nuzlocke");
        expect(hardcore).toBeDefined();
        expect(hardcore!.rules.length).toBeGreaterThan(3);
        expect(hardcore!.rules.some((r) => r.toLowerCase().includes("set battle"))).toBe(true);
        expect(hardcore!.rules.some((r) => r.toLowerCase().includes("no bag items"))).toBe(true);
        expect(hardcore!.rules.some((r) => r.toLowerCase().includes("level"))).toBe(true);
    });
});

describe("RulesEditor", () => {
    const mockEditRule = vi.fn();
    const mockAddRule = vi.fn();
    const mockDeleteRule = vi.fn();
    const mockResetRules = vi.fn();
    const mockSetRules = vi.fn();

    const defaultProps = {
        rules: [
            "Rule 1: Faints mean death",
            "Rule 2: First encounter only",
            "Rule 3: Nickname all Pokémon",
        ],
        editRule: mockEditRule,
        addRule: mockAddRule,
        deleteRule: mockDeleteRule,
        resetRules: mockResetRules,
        setRules: mockSetRules,
    };

    beforeEach(() => {
        mockEditRule.mockClear();
        mockAddRule.mockClear();
        mockDeleteRule.mockClear();
        mockResetRules.mockClear();
        mockSetRules.mockClear();
    });

    it("renders all rules", () => {
        render(<RulesEditor {...defaultProps} />);
        
        expect(screen.getByDisplayValue("Rule 1: Faints mean death")).toBeDefined();
        expect(screen.getByDisplayValue("Rule 2: First encounter only")).toBeDefined();
        expect(screen.getByDisplayValue("Rule 3: Nickname all Pokémon")).toBeDefined();
    });

    it("renders Add Rule button", () => {
        render(<RulesEditor {...defaultProps} />);
        expect(screen.getByText("Add Rule")).toBeDefined();
    });

    it("renders Reset Rules button", () => {
        render(<RulesEditor {...defaultProps} />);
        expect(screen.getByText("Reset Rules")).toBeDefined();
    });

    it("calls addRule when Add Rule button is clicked", () => {
        render(<RulesEditor {...defaultProps} />);
        const addButton = screen.getByText("Add Rule");
        
        fireEvent.click(addButton);
        
        expect(mockAddRule).toHaveBeenCalledTimes(1);
    });

    it("calls resetRules when Reset Rules button is clicked", () => {
        render(<RulesEditor {...defaultProps} />);
        const resetButton = screen.getByText("Reset Rules");
        
        fireEvent.click(resetButton);
        
        expect(mockResetRules).toHaveBeenCalledTimes(1);
    });

    it("renders rulesets dropdown", () => {
        render(<RulesEditor {...defaultProps} />);
        expect(screen.getByText("Select a ruleset...")).toBeDefined();
    });

    it("renders all preset options in dropdown", () => {
        render(<RulesEditor {...defaultProps} />);
        
        presetRules.forEach((preset) => {
            expect(screen.getByRole("option", { name: preset.name })).toBeDefined();
        });
    });

    it("shows preset description when preset is selected", () => {
        render(<RulesEditor {...defaultProps} />);
        const select = screen.getByRole("combobox");

        fireEvent.change(select, { target: { value: "Hardcore Nuzlocke" } });

        const hardcore = presetRules.find((p) => p.name === "Hardcore Nuzlocke");
        expect(screen.getByText(hardcore!.description)).toBeDefined();
    });

    it("Apply button is disabled when no ruleset is selected", () => {
        render(<RulesEditor {...defaultProps} />);
        const applyButton = screen.getByText("Apply Ruleset").closest("button") as HTMLButtonElement;

        expect(applyButton.disabled).toBe(true);
    });

    it("Apply button is enabled when a ruleset is selected", () => {
        render(<RulesEditor {...defaultProps} />);
        const select = screen.getByRole("combobox");

        fireEvent.change(select, { target: { value: "Classic Nuzlocke" } });

        const applyButton = screen.getByText("Apply Ruleset").closest("button") as HTMLButtonElement;
        expect(applyButton.disabled).toBe(false);
    });

    it("calls setRules with ruleset rules when Apply is clicked", () => {
        render(<RulesEditor {...defaultProps} />);
        const select = screen.getByRole("combobox");

        fireEvent.change(select, { target: { value: "Classic Nuzlocke" } });
        fireEvent.click(screen.getByText("Apply Ruleset"));

        const classic = presetRules.find((p) => p.name === "Classic Nuzlocke");
        expect(mockSetRules).toHaveBeenCalledWith(classic!.rules);
    });

    it("renders rule numbers", () => {
        render(<RulesEditor {...defaultProps} />);
        
        expect(screen.getByText("1")).toBeDefined();
        expect(screen.getByText("2")).toBeDefined();
        expect(screen.getByText("3")).toBeDefined();
    });

    it("calls editRule when rule text is changed", () => {
        render(<RulesEditor {...defaultProps} />);
        const ruleInput = screen.getByDisplayValue("Rule 1: Faints mean death");
        
        fireEvent.change(ruleInput, { target: { value: "Updated rule" } });
        
        expect(mockEditRule).toHaveBeenCalledWith(0, "Updated rule");
    });

    it("calls deleteRule when delete icon is clicked", () => {
        const { container } = render(<RulesEditor {...defaultProps} />);
        const deleteButtons = container.querySelectorAll(".rule-delete");
        
        fireEvent.click(deleteButtons[0]);
        
        expect(mockDeleteRule).toHaveBeenCalledWith(0);
    });

    it("renders with empty rules array", () => {
        const emptyProps = { ...defaultProps, rules: [] };
        const { container } = render(<RulesEditor {...emptyProps} />);
        
        const ruleItems = container.querySelectorAll(".rules-list-item");
        expect(ruleItems.length).toBe(0);
    });
});

describe("RulesEditorDialogBase", () => {
    const mockOnClose = vi.fn();
    const mockEditRule = vi.fn();
    const mockAddRule = vi.fn();
    const mockDeleteRule = vi.fn();
    const mockResetRules = vi.fn();
    const mockSetRules = vi.fn();

    const dialogProps = {
        rules: ["Test rule"],
        editRule: mockEditRule,
        addRule: mockAddRule,
        deleteRule: mockDeleteRule,
        resetRules: mockResetRules,
        setRules: mockSetRules,
        onClose: mockOnClose,
        isOpen: true,
        style: { editorDarkMode: false },
    };

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it("renders dialog when isOpen is true", () => {
        render(<RulesEditorDialogBase {...dialogProps} />);
        expect(screen.getByText("Rules Editor")).toBeDefined();
    });

    it("does not render dialog content when isOpen is false", () => {
        render(<RulesEditorDialogBase {...dialogProps} isOpen={false} />);
        expect(screen.queryByText("Rules Editor")).toBeNull();
    });

    it("renders RulesEditor inside dialog", () => {
        render(<RulesEditorDialogBase {...dialogProps} />);
        expect(screen.getByDisplayValue("Test rule")).toBeDefined();
    });

    it("applies dark mode class when editorDarkMode is true", () => {
        const { baseElement } = render(
            <RulesEditorDialogBase {...dialogProps} style={{ editorDarkMode: true }} />
        );
        const dialog = baseElement.querySelector(".rules-editor-dialog");
        expect(dialog).not.toBeNull();
        expect(dialog!.className.includes("bp5-dark")).toBe(true);
    });

    it("does not apply dark mode class when editorDarkMode is false", () => {
        const { baseElement } = render(<RulesEditorDialogBase {...dialogProps} />);
        const dialog = baseElement.querySelector(".rules-editor-dialog");
        expect(dialog).not.toBeNull();
        expect(dialog!.className.includes("bp5-dark")).toBe(false);
    });
});

