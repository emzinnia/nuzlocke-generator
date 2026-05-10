const DEFAULT_CORS_PROXY_BASE_URL =
    "https://cors-anywhere-nuzgen.herokuapp.com";

export const imagePlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";

export type DomToImageDownloadOptions = {
    corsImg: {
        method: "GET";
        url: string;
        data: Record<string, never>;
    };
    imagePlaceholder: string;
};

export function getDomToImageDownloadOptions(): DomToImageDownloadOptions {
    const proxyBase = (
        import.meta.env.VITE_CORS_ANYWHERE_URL ?? DEFAULT_CORS_PROXY_BASE_URL
    ).replace(/\/$/, "");

    return {
        corsImg: {
            method: "GET",
            url: `${proxyBase}/#{cors}`,
            data: {},
        },
        imagePlaceholder,
    };
}
