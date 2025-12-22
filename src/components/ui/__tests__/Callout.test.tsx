import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "../Callout";
import { Intent } from "../intent";

describe("<Callout />", () => {
    it("renders title, children, and intent styling", () => {
        const { container } = render(
            <Callout title="Heads up" intent={Intent.WARNING}>
                Important info
            </Callout>,
        );

        expect(screen.getByText("Heads up")).toBeTruthy();
        expect(screen.getByText("Important info")).toBeTruthy();

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("bg-warning-50");
        expect(wrapper.querySelector("svg")).not.toBeNull();
    });

    it("supports minimal styling and custom icons", () => {
        const customIcon = <span data-testid="custom-icon">!</span>;
        const { container } = render(
            <Callout icon={customIcon} minimal className="extra">
                Custom
            </Callout>,
        );

        expect(screen.getByTestId("custom-icon")).toBeTruthy();

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("bg-transparent");
        expect(wrapper.className).toContain("extra");
    });

    it("omits the icon when explicitly set to null", () => {
        const { container } = render(<Callout icon={null}>No icon</Callout>);

        expect(container.querySelector("svg")).toBeNull();
    });
});

