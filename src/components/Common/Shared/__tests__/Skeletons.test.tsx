import * as React from "react";
import { render } from "@testing-library/react";
import { Skeleton } from "../Skeletons";

describe("Skeleton", () => {
    it("renders a skeleton element", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.querySelector(".bp5-skeleton");
        expect(skeletonElement).toBeDefined();
        expect(skeletonElement).not.toBeNull();
    });

    it("has the skeleton class from blueprintjs", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.firstChild as HTMLElement;
        expect(skeletonElement.className).toContain("bp5-skeleton");
    });

    it("has correct dimensions", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.firstChild as HTMLElement;
        expect(skeletonElement.style.width).toBe("100%");
        expect(skeletonElement.style.height).toBe("100%");
    });
});
