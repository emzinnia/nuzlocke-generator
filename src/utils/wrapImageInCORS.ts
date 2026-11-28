function fileToBase64(file: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
            resolve(reader.result);
        };

        reader.onerror = reject;
    });
}

export async function wrapImageInCORS(url: string) {
    // Primary path: fetch the remote image via a CORS proxy and inline as base64.
    // This allows downstream uses (e.g. canvas/export) that require CORS-safe image data.
    //
    // In production, the proxy may be unavailable/rate-limited/blocked; in that case we
    // fall back to the direct URL so the image still renders in the browser.
    try {
        const proxyBase =
            import.meta.env.VITE_CORS_ANYWHERE_URL ??
            "https://cors-anywhere-nuzgen.herokuapp.com";
        const response = await fetch(`${proxyBase}/${url}`, {
            mode: "cors",
            // origin: location.origin,
            // @ts-expect-error valid for cors-anywhere
            "X-Requested-With": "XMLHttpRequest",
        });

        if (!response.ok) {
            throw new Error(
                `CORS proxy request failed (${response.status} ${response.statusText})`,
            );
        }

        const img = await response.blob();
        return `url(${await fileToBase64(img)})`;
    } catch (e) {
        console.warn(
            "[wrapImageInCORS] Falling back to direct image URL (proxy failed):",
            url,
            e,
        );
        return `url(${url})`;
    }
}

export async function wrapImageInCORSPlain(url: string) {
    // Same as wrapImageInCORS(), but returns a plain src string for <img src="..."/>.
    try {
        const proxyBase =
            import.meta.env.VITE_CORS_ANYWHERE_URL ??
            "https://cors-anywhere-nuzgen.herokuapp.com";
        const response = await fetch(`${proxyBase}/${url}`, {
            mode: "cors",
            // @ts-expect-error valid for cors-anywhere
            "X-Requested-With": "XMLHttpRequest",
        });

        if (!response.ok) {
            throw new Error(
                `CORS proxy request failed (${response.status} ${response.statusText})`,
            );
        }

        const img = await response.blob();
        return `${await fileToBase64(img)}`;
    } catch (e) {
        console.warn(
            "[wrapImageInCORSPlain] Falling back to direct image URL (proxy failed):",
            url,
            e,
        );
        return url;
    }
}
