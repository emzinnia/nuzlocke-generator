function fileToBase64(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
            resolve(reader.result as string);
        };

        reader.onerror = reject;
    });
}

const IMAGE_PROXY_PATH = "/image-proxy";
const CORS_PLACEHOLDER = "#{cors}";

type DomToImageCorsOptions =
    | {
          cacheBust: true;
          corsImg: {
              method: "POST";
              url: string;
              headers: { "Content-Type": "application/json" };
              data: { url: string };
          };
      }
    | {
          cacheBust: true;
          corsImg: {
              method: "GET";
              url: string;
          };
      };

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getConfiguredProxyBase = () => {
    const proxyBase = import.meta.env.VITE_CORS_ANYWHERE_URL?.trim();
    return proxyBase ? trimTrailingSlash(proxyBase) : undefined;
};

export function getCorsImageProxyFetchUrl(url: string) {
    const proxyBase = getConfiguredProxyBase();

    if (proxyBase) {
        return `${proxyBase}/${url}`;
    }

    return `${IMAGE_PROXY_PATH}?url=${encodeURIComponent(url)}`;
}

export function getDomToImageCorsOptions(): DomToImageCorsOptions {
    const proxyBase = getConfiguredProxyBase();

    if (proxyBase) {
        return {
            cacheBust: true,
            corsImg: {
                method: "GET",
                url: `${proxyBase}/${CORS_PLACEHOLDER}`,
            },
        };
    }

    return {
        cacheBust: true,
        corsImg: {
            method: "POST",
            url: IMAGE_PROXY_PATH,
            headers: { "Content-Type": "application/json" },
            data: { url: CORS_PLACEHOLDER },
        },
    };
}

async function fetchImageAsDataUrl(url: string) {
    const response = await fetch(getCorsImageProxyFetchUrl(url), {
        mode: "cors",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Image proxy request failed (${response.status} ${response.statusText})`,
        );
    }

    return fileToBase64(await response.blob());
}

export async function wrapImageInCORS(url: string) {
    // Primary path: fetch the remote image through the first-party proxy and inline as base64.
    // This allows downstream uses (e.g. canvas/export) that require CORS-safe image data.
    //
    // If the proxy or remote host fails, fall back to the direct URL so the browser can still
    // render hotlink-friendly images instead of leaving the result blank.
    try {
        return `url(${await fetchImageAsDataUrl(url)})`;
    } catch (e) {
        console.warn(
            "[wrapImageInCORS] Falling back to direct image URL (image proxy failed):",
            url,
            e,
        );
        return `url(${url})`;
    }
}

export async function wrapImageInCORSPlain(url: string) {
    // Same as wrapImageInCORS(), but returns a plain src string for <img src="..."/>.
    try {
        return await fetchImageAsDataUrl(url);
    } catch (e) {
        console.warn(
            "[wrapImageInCORSPlain] Falling back to direct image URL (image proxy failed):",
            url,
            e,
        );
        return url;
    }
}
