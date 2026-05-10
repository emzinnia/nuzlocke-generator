import { getCorsProxyUrl, isRemoteImageUrl } from "./downloadImages";

function fileToBase64(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }
            reject(new Error("Expected FileReader to return a data URL."));
        };

        reader.onerror = reject;
    });
}

async function fetchImageViaCorsProxy(url: string) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
        const response = await fetch(getCorsProxyUrl(url), {
            mode: "cors",
            signal: controller.signal,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        if (!response.ok) {
            throw new Error(
                `CORS proxy request failed (${response.status} ${response.statusText})`,
            );
        }

        const img = await response.blob();
        if (img.type && !img.type.startsWith("image/")) {
            throw new Error(`CORS proxy returned non-image content (${img.type})`);
        }

        return fileToBase64(img);
    } finally {
        window.clearTimeout(timeout);
    }
}

export async function wrapImageInCORS(url: string): Promise<string> {
    if (!isRemoteImageUrl(url)) {
        return `url(${url})`;
    }

    // Primary path: fetch the remote image via a CORS proxy and inline as base64.
    // This allows downstream uses (e.g. canvas/export) that require CORS-safe image data.
    //
    // In production, the proxy may be unavailable/rate-limited/blocked; in that case we
    // fall back to the direct URL so the image still renders in the browser.
    try {
        return `url(${await fetchImageViaCorsProxy(url)})`;
    } catch (e) {
        console.warn(
            "[wrapImageInCORS] Falling back to direct image URL (proxy failed):",
            url,
            e,
        );
        return `url(${url})`;
    }
}

export async function wrapImageInCORSPlain(url: string): Promise<string> {
    if (!isRemoteImageUrl(url)) {
        return url;
    }

    // Same as wrapImageInCORS(), but returns a plain src string for <img src="..."/>.
    try {
        return await fetchImageViaCorsProxy(url);
    } catch (e) {
        console.warn(
            "[wrapImageInCORSPlain] Falling back to direct image URL (proxy failed):",
            url,
            e,
        );
        return url;
    }
}
