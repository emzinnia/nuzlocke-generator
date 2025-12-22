import * as React from "react";
import { render } from "@testing-library/react";
import { Skeleton } from "../Skeletons";

describe("Skeleton", () => {
    it("renders a skeleton element with animation", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.firstChild as HTMLElement;
        expect(skeletonElement).toBeDefined();
        expect(skeletonElement).not.toBeNull();
        expect(skeletonElement.className).toContain("animate-pulse");
    });

    it("has Tailwind skeleton styling classes", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.firstChild as HTMLElement;
        expect(skeletonElement.className).toContain("bg-slate-200");
        expect(skeletonElement.className).toContain("rounded");
    });

    it("has correct dimensions", () => {
        const { container } = render(Skeleton);
        const skeletonElement = container.firstChild as HTMLElement;
        expect(skeletonElement.style.width).toBe("100%");
        expect(skeletonElement.style.height).toBe("100%");
    });
});
