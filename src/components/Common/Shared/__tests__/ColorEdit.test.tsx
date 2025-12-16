import * as React from "react";
import { render, screen, fireEvent } from "utils/testUtils";
import { ColorEditBase, rgbaOrHex } from "../ColorEdit";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Styles } from "models";

describe("rgbaOrHex", () => {
    it("returns hex when alpha is 1", () => {
        const result = rgbaOrHex({ hex: "#ff0000", rgb: { r: 255, g: 0, b: 0, a: 1 } });
        expect(result).toBe("#ff0000");
    });

    it("returns rgba when alpha is not 1", () => {
        const result = rgbaOrHex({ hex: "#ff0000", rgb: { r: 255, g: 0, b: 0, a: 0.5 } });
        expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("returns the value itself when no rgb property exists", () => {
        const result = rgbaOrHex("#00ff00");
        expect(result).toBe("#00ff00");
    });

    it("handles missing alpha value", () => {
        const result = rgbaOrHex({ hex: "#0000ff", rgb: { r: 0, g: 0, b: 255 } });
        expect(result).toBe("#0000ff");
    });
});

describe("ColorEditBase", () => {
    const mockOnChange = vi.fn();
    const mockOnColorChange = vi.fn();
    const defaultProps = {
        value: "#ff0000",
        onChange: mockOnChange,
        onColorChange: mockOnColorChange,
        name: "test-color",
        style: { editorDarkMode: false } as Partial<Styles> as Styles,
    };

    beforeEach(() => {
        mockOnChange.mockClear();
        mockOnColorChange.mockClear();
    });

    it("renders a text input with the color value", () => {
        render(<ColorEditBase {...defaultProps} />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input).toBeDefined();
        expect(input.value).toBe("#ff0000");
    });

    it("renders a color preview circle", () => {
        const { container } = render(<ColorEditBase {...defaultProps} />);
        const colorPreview = container.querySelector('div[style*="border-radius"]');
        expect(colorPreview).not.toBeNull();
    });

    it("calls onChange when text input value changes", () => {
        render(<ColorEditBase {...defaultProps} />);
        const input = screen.getByRole("textbox");
        
        fireEvent.change(input, { target: { value: "#00ff00" } });
        
        expect(mockOnChange).toHaveBeenCalled();
    });

    it("has the correct name attribute on input", () => {
        render(<ColorEditBase {...defaultProps} />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.name).toBe("test-color");
    });

    it("displays rgba format for colors with transparency", () => {
        const propsWithAlpha = {
            ...defaultProps,
            value: { hex: "#ff0000", rgb: { r: 255, g: 0, b: 0, a: 0.5 } },
        };
        render(<ColorEditBase {...propsWithAlpha} />);
        const input = screen.getByRole("textbox") as HTMLInputElement;
        expect(input.value).toBe("rgba(255, 0, 0, 0.5)");
    });
});
