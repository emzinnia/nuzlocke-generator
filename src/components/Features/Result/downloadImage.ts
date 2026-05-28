export interface ResultDownloadOptions {
    corsImage: boolean;
    height: number;
    width: number;
    style: Record<string, string>;
}

const pixelValue = (value: string | null | undefined) => {
    if (!value) return 0;

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getRenderedSize = (
    node: HTMLElement,
    direction: "height" | "width",
) => {
    const isHeight = direction === "height";
    const scrollSize = isHeight ? node.scrollHeight : node.scrollWidth;
    const offsetSize = isHeight ? node.offsetHeight : node.offsetWidth;
    const clientSize = isHeight ? node.clientHeight : node.clientWidth;
    const inlineSize = pixelValue(
        isHeight ? node.style.height : node.style.width,
    );
    const inlineMinSize = pixelValue(
        isHeight ? node.style.minHeight : node.style.minWidth,
    );

    return Math.ceil(
        Math.max(scrollSize, offsetSize, clientSize, inlineSize, inlineMinSize),
    );
};

export const getResultDownloadOptions = (
    node: HTMLElement,
): ResultDownloadOptions => {
    const height = getRenderedSize(node, "height");
    const width = getRenderedSize(node, "width");

    return {
        corsImage: true,
        height,
        width,
        style: {
            height: `${height}px`,
            margin: "0",
            maxHeight: "none",
            minHeight: `${height}px`,
            minWidth: `${width}px`,
            overflow: "visible",
            transform: "none",
            width: `${width}px`,
        },
    };
};
