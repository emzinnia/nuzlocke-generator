import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "../Checkbox";

describe("<Checkbox />", () => {
    it("renders a label and toggles when controlled", () => {
        const Wrapper = () => {
            const [checked, setChecked] = React.useState(false);
            return <Checkbox label="Agree" checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
        };

        render(<Wrapper />);

        const input = screen.getByRole("checkbox", { name: "Agree" }) as HTMLInputElement;
        expect(input.checked).toBe(false);

        fireEvent.click(input);
        expect(input.checked).toBe(true);
    });

    it("supports indeterminate state and large sizing", () => {
        const { container } = render(<Checkbox label="Maybe" indeterminate large />);

        const input = screen.getByRole("checkbox", { name: "Maybe" }) as HTMLInputElement;
        expect(input.indeterminate).toBe(true);

        const box = container.querySelector("div.relative > div");
        expect(box?.className).toContain("h-5 w-5");
        expect(box?.querySelector("svg")).not.toBeNull();
    });

    it("applies inline and disabled styling", () => {
        const { container } = render(<Checkbox label="Inline" inline disabled />);

        const label = container.querySelector("label") as HTMLElement;
        expect(label.className).toContain("inline-flex");
        expect(label.className).toContain("opacity-50");
    });
});

