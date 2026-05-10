export type DomToImageDownloadOptions = {
    corsImage: boolean;
    width: number;
    height: number;
    style: Record<string, string>;
};

const positiveCeil = (value: number | undefined) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return 0;

    return Math.max(0, Math.ceil(value));
};

const getFallbackRectDimension = (
    node: HTMLElement,
    dimension: "width" | "height",
) => positiveCeil(node.getBoundingClientRect()[dimension]);

const getElementWidth = (node: HTMLElement) => {
    const layoutWidth = Math.max(
        positiveCeil(node.scrollWidth),
        positiveCeil(node.offsetWidth),
        positiveCeil(node.clientWidth),
    );

    return Math.max(1, layoutWidth || getFallbackRectDimension(node, "width"));
};

const getElementHeight = (node: HTMLElement) => {
    const layoutHeight = Math.max(
        positiveCeil(node.scrollHeight),
        positiveCeil(node.offsetHeight),
        positiveCeil(node.clientHeight),
    );

    return Math.max(1, layoutHeight || getFallbackRectDimension(node, "height"));
};

export const getResultImageDownloadOptions = (
    node: HTMLElement,
): DomToImageDownloadOptions => {
    const width = getElementWidth(node);
    const height = getElementHeight(node);

    return {
        corsImage: true,
        width,
        height,
        style: {
            bottom: "auto",
            height: `${height}px`,
            left: "0",
            margin: "0",
            maxHeight: "none",
            maxWidth: "none",
            minHeight: `${height}px`,
            minWidth: `${width}px`,
            overflow: "visible",
            overflowX: "visible",
            overflowY: "visible",
            position: "relative",
            right: "auto",
            top: "0",
            transform: "none",
            transformOrigin: "0 0",
            transition: "none",
            width: `${width}px`,
        },
    };
};
