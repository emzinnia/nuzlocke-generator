import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "../Icon";

describe("<Icon />", () => {
    it("renders an SVG for mapped icon names", () => {
        const { container } = render(<Icon icon="tick" />);
        expect(container.querySelector("svg")).not.toBeNull();
    });

    it("falls back to a placeholder for unknown icons", () => {
        const { getByRole } = render(<Icon icon="unknown-icon" />);
        const placeholder = getByRole("img");

        expect(placeholder.textContent).toBe("?");
        expect(placeholder.getAttribute("aria-label")).toBe("unknown-icon");
    });
});

