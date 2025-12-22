import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "../Spinner";
import { Intent } from "../intent";

describe("<Spinner />", () => {
    it("renders an SVG with the provided size", () => {
        const { container, getByLabelText } = render(<Spinner size={24} />);

        const svg = container.querySelector("svg");
        expect(svg?.getAttribute("width")).toBe("24");
        expect(svg?.getAttribute("height")).toBe("24");
        expect(getByLabelText("Loading")).toBeTruthy();
    });

    it("applies intent-based text color classes", () => {
        const { container } = render(<Spinner intent={Intent.DANGER} className="extra" />);
        const svg = container.querySelector("svg") as SVGElement;

        expect(svg.getAttribute("class")).toContain("text-danger-600");
        expect(svg.getAttribute("class")).toContain("animate-spin");
        expect(svg.getAttribute("class")).toContain("extra");
    });
});

