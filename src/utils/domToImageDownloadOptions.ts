const DEFAULT_CORS_PROXY_URL = "https://cors-anywhere-nuzgen.herokuapp.com";

const TRANSPARENT_IMAGE_PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";

export interface DomToImageDownloadOptions {
    corsImg: {
        method: "GET";
        url: string;
        data: Record<string, never>;
    };
    imagePlaceholder: string;
}

export function getCorsProxyBaseUrl() {
    return (
        import.meta.env.VITE_CORS_ANYWHERE_URL ?? DEFAULT_CORS_PROXY_URL
    ).replace(/\/$/, "");
}

export function getDomToImageDownloadOptions(): DomToImageDownloadOptions {
    return {
        corsImg: {
            method: "GET",
            url: `${getCorsProxyBaseUrl()}/#{cors}`,
            data: {},
        },
        imagePlaceholder: TRANSPARENT_IMAGE_PLACEHOLDER,
    };
}
