const remoteUrlPattern = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const specialUrlPattern = /^(?:data|blob):/i;

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const getStaticAssetsBaseUrl = () =>
    (
        import.meta.env.VITE_STATIC_ASSETS_BASE_URL ??
        import.meta.env.VITE_ASSET_BASE_URL ??
        ""
    ).trim();

export const normalizeAssetPath = (assetPath: string) =>
    assetPath.replace(/^\.\//, "").replace(/^\/+/, "");

export const getAssetUrl = (
    assetPath: string,
    baseUrl = getStaticAssetsBaseUrl(),
) => {
    if (remoteUrlPattern.test(assetPath) || specialUrlPattern.test(assetPath)) {
        return assetPath;
    }

    const normalizedPath = normalizeAssetPath(assetPath);
    const normalizedBaseUrl = trimTrailingSlashes(baseUrl.trim());

    if (!normalizedBaseUrl) {
        return normalizedPath;
    }

    return `${normalizedBaseUrl}/${normalizedPath}`;
};

export const getAssetCssUrl = (
    assetPath: string,
    baseUrl = getStaticAssetsBaseUrl(),
) => `url(${getAssetUrl(assetPath, baseUrl)})`;
