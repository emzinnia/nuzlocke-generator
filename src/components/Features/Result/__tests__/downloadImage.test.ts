import { getResultImageDownloadOptions } from "../downloadImage";

const setReadOnlyNumber = (
    node: HTMLElement,
    property: keyof HTMLElement,
    value: number,
) => {
    Object.defineProperty(node, property, {
        configurable: true,
        value,
    });
};

describe("getResultImageDownloadOptions", () => {
    it("exports the full scrollable result instead of the clipped viewport", () => {
        const node = document.createElement("div");
        setReadOnlyNumber(node, "clientWidth", 800);
        setReadOnlyNumber(node, "offsetWidth", 800);
        setReadOnlyNumber(node, "scrollWidth", 1200);
        setReadOnlyNumber(node, "clientHeight", 600);
        setReadOnlyNumber(node, "offsetHeight", 600);
        setReadOnlyNumber(node, "scrollHeight", 1400);

        const options = getResultImageDownloadOptions(node);

        expect(options.width).toBe(1200);
        expect(options.height).toBe(1400);
        expect(options.style.width).toBe("1200px");
        expect(options.style.height).toBe("1400px");
        expect(options.style.minHeight).toBe("1400px");
        expect(options.style.overflow).toBe("visible");
        expect(options.style.overflowY).toBe("visible");
    });

    it("removes preview-only positioning and transforms from the cloned image", () => {
        const node = document.createElement("div");
        setReadOnlyNumber(node, "clientWidth", 300);
        setReadOnlyNumber(node, "offsetWidth", 300);
        setReadOnlyNumber(node, "scrollWidth", 300);
        setReadOnlyNumber(node, "clientHeight", 200);
        setReadOnlyNumber(node, "offsetHeight", 200);
        setReadOnlyNumber(node, "scrollHeight", 200);

        const options = getResultImageDownloadOptions(node);

        expect(options.style.transform).toBe("none");
        expect(options.style.position).toBe("relative");
        expect(options.style.left).toBe("0");
        expect(options.style.top).toBe("0");
        expect(options.style.margin).toBe("0");
        expect(options.style.transition).toBe("none");
    });

    it("uses unscaled layout dimensions instead of preview transform dimensions", () => {
        const node = document.createElement("div");
        setReadOnlyNumber(node, "clientWidth", 1000);
        setReadOnlyNumber(node, "offsetWidth", 1000);
        setReadOnlyNumber(node, "scrollWidth", 1000);
        setReadOnlyNumber(node, "clientHeight", 750);
        setReadOnlyNumber(node, "offsetHeight", 750);
        setReadOnlyNumber(node, "scrollHeight", 750);
        node.getBoundingClientRect = () =>
            ({
                width: 2000,
                height: 1500,
            }) as DOMRect;

        const options = getResultImageDownloadOptions(node);

        expect(options.width).toBe(1000);
        expect(options.height).toBe(750);
    });
});
