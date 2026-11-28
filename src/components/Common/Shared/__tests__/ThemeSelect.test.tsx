import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { ThemeSelectBase } from "../ThemeSelect";
import { listOfThemes } from "utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

describe("ThemeSelectBase", () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it("renders a select element with current theme", () => {
        render(<ThemeSelectBase theme="Default Light" onChange={mockOnChange} />);
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select).toBeDefined();
        expect(select.value).toBe("Default Light");
    });

    it("renders all available themes as options", () => {
        render(<ThemeSelectBase theme="Default Light" onChange={mockOnChange} />);
        const options = screen.getAllByRole("option");
        expect(options.length).toBe(listOfThemes.length);
    });

    it("calls onChange with selected template when selection changes", () => {
        render(<ThemeSelectBase theme="Default Light" onChange={mockOnChange} />);
        const select = screen.getByRole("combobox");
        
        fireEvent.change(select, { target: { value: "Default Dark" } });
        
        expect(mockOnChange).toHaveBeenCalledWith({ template: "Default Dark" });
    });

    it("displays each theme option with correct value", () => {
        render(<ThemeSelectBase theme="Default Light" onChange={mockOnChange} />);
        
        listOfThemes.forEach((theme) => {
            const option = screen.getByRole("option", { name: theme }) as HTMLOptionElement;
            expect(option.value).toBe(theme);
        });
    });
});
