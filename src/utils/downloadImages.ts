export const DEFAULT_CORS_PROXY_BASE =
    "https://cors-anywhere-nuzgen.herokuapp.com";

export const TRANSPARENT_IMAGE_PLACEHOLDER =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42mP8z8BQDwAFgwJ/lxGH5QAAAABJRU5ErkJggg==";

export type DomToImageOptions = {
    cacheBust: boolean;
    imagePlaceholder: string;
    corsImg: {
        url: string;
        headers: Record<string, string>;
    };
};

export const isRemoteImageUrl = (url: string) => /^https?:\/\//i.test(url);

export const getCorsProxyBase = () =>
    (
        import.meta.env.VITE_CORS_ANYWHERE_URL || DEFAULT_CORS_PROXY_BASE
    ).replace(/\/$/, "");

export const getCorsProxyUrl = (url: string) => `${getCorsProxyBase()}/${url}`;

export const getDomToImageOptions = (): DomToImageOptions => ({
    cacheBust: true,
    imagePlaceholder: TRANSPARENT_IMAGE_PLACEHOLDER,
    corsImg: {
        url: `${getCorsProxyBase()}/#{cors}`,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    },
});

