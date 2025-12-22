import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../Button";
import { Intent } from "../intent";

describe("<Button />", () => {
    it("renders its label and fires click handlers", () => {
        const onClick = vi.fn();
        render(
            <Button intent={Intent.PRIMARY} onClick={onClick}>
                Click me
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Click me" });
        fireEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(button.className).toContain("bg-primary-500");
    });

    it("disables and shows a spinner when loading", () => {
        render(<Button loading>Loading</Button>);

        const button = screen.getByRole("button", { name: /Loading/ }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        expect(screen.getByLabelText("Loading")).toBeTruthy();
    });

    it("renders an anchor when href is provided and not disabled", () => {
        render(
            <Button href="https://example.com" rightIcon="add">
                Go
            </Button>,
        );

        const link = screen.getByRole("link", { name: "Go" }) as HTMLAnchorElement;
        expect(link.getAttribute("href")).toBe("https://example.com");
        expect(link.querySelector("svg")).not.toBeNull();
    });

    it("falls back to a button when href is provided but disabled", () => {
        render(
            <Button href="https://example.com" disabled>
                Disabled link
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Disabled link" });
        expect(button.tagName).toBe("BUTTON");
    });

    it("applies alignment, active, and fill classes", () => {
        render(
            <Button alignText="left" active fill>
                Wide
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Wide" });
        expect(button.className).toContain("justify-start");
        expect(button.className).toContain("ring-2");
        expect(button.className).toContain("w-full");
    });

    it("supports minimal and outlined variants", () => {
        const { rerender } = render(
            <Button minimal intent={Intent.DANGER}>
                Minimal
            </Button>,
        );

        let button = screen.getByRole("button", { name: "Minimal" });
        expect(button.className).toContain("bg-transparent");
        expect(button.className).toContain("border-0");
        expect(button.className).toContain("text-danger-600");

        rerender(
            <Button outlined intent={Intent.SUCCESS}>
                Outlined
            </Button>,
        );

        button = screen.getByRole("button", { name: "Outlined" });
        expect(button.className).toContain("border");
        expect(button.className).toContain("border-success-500");
    });
});

