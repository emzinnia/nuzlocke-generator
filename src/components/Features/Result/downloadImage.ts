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

const getElementWidth = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    return Math.max(
        1,
        positiveCeil(node.scrollWidth),
        positiveCeil(node.offsetWidth),
        positiveCeil(node.clientWidth),
        positiveCeil(rect.width),
    );
};

const getElementHeight = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    return Math.max(
        1,
        positiveCeil(node.scrollHeight),
        positiveCeil(node.offsetHeight),
        positiveCeil(node.clientHeight),
        positiveCeil(rect.height),
    );
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
            overflow: "visible",
            overflowX: "visible",
            overflowY: "visible",
            position: "relative",
            right: "auto",
            top: "0",
            transform: "none",
            transformOrigin: "0 0",
            width: `${width}px`,
        },
    };
};
