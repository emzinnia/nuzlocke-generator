import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "../ButtonGroup";
import { Button } from "../Button";

describe("<ButtonGroup />", () => {
    it("renders children in a horizontal group by default", () => {
        const { container } = render(
            <ButtonGroup>
                <Button>One</Button>
                <Button>Two</Button>
            </ButtonGroup>,
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("flex-row");
        expect(wrapper.className).not.toContain("flex-col");

        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBe(2);
    });

    it("supports vertical layout, fill width, and custom classes", () => {
        const { container } = render(
            <ButtonGroup vertical fill className="extra">
                <Button>Only</Button>
            </ButtonGroup>,
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("flex-col");
        expect(wrapper.className).toContain("w-full");
        expect(wrapper.className).toContain("extra");
    });
});

