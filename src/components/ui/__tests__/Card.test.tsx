import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("<Card />", () => {
    it("renders children and applies elevation classes", () => {
        const { container, rerender } = render(<Card elevation={2}>Content</Card>);

        expect(screen.getByText("Content")).toBeTruthy();
        expect(container.firstChild?.className).toContain("shadow");

        rerender(<Card elevation={4}>Content</Card>);
        expect(container.firstChild?.className).toContain("shadow-xl");
    });

    it("enables hover styling when interactive", () => {
        const { container } = render(<Card interactive>Interactive</Card>);
        expect(container.firstChild?.className).toContain("hover:shadow-lg");
        expect(container.firstChild?.className).toContain("cursor-pointer");
    });
});

