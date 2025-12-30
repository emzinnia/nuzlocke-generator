import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ShapeInput, Shape } from "../ShapeInput";

describe("ShapeInput", () => {
    it("renders with default selected shape", () => {
        const { container } = render(<ShapeInput shapes={[Shape.Circle, Shape.Square]} />);
        expect(container.querySelector("input")).not.toBeNull();
    });

    it("renders an input element", () => {
        render(<ShapeInput shapes={[Shape.Circle, Shape.Square, Shape.Diamond]} />);
        const input = screen.getByRole("textbox");
        expect(input).toBeDefined();
    });

    it("renders with shape container", () => {
        const { container } = render(<ShapeInput shapes={[Shape.Triangle]} />);
        expect(container.querySelector(".shape")).not.toBeNull();
    });

    it("initializes with Circle as default selected shape", () => {
        const component = new ShapeInput({ shapes: [Shape.Circle, Shape.Square] });
        expect(component.state.selectedShape).toBe(Shape.Circle);
    });

    it("exports Shape enum with expected values", () => {
        expect(Shape.Circle).toBe(0);
        expect(Shape.Square).toBe(1);
        expect(Shape.Diamond).toBe(2);
        expect(Shape.Triangle).toBe(6);
    });
});
