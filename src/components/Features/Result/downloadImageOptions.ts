const getCorsProxyUrl = () =>
    import.meta.env.VITE_CORS_ANYWHERE_URL ??
    "https://cors-anywhere-nuzgen.herokuapp.com";

export const transparentImagePlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";

export type DownloadImageOptions = {
    corsImg: {
        method: "GET";
        url: string;
        data: Record<string, never>;
    };
    imagePlaceholder: string;
};

export function getDownloadImageOptions(): DownloadImageOptions {
    return {
        corsImg: {
            method: "GET",
            url: `${getCorsProxyUrl().replace(/\/$/, "")}/#{cors}`,
            data: {},
        },
        imagePlaceholder: transparentImagePlaceholder,
    };
}
