import net from "node:net";

export const IMAGE_PROXY_ROUTE = "/image-proxy";
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const IMAGE_PROXY_TIMEOUT_MS = 30000;

export class ImageProxyError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "ImageProxyError";
        this.statusCode = statusCode;
    }
}

const isPrivateIPv4 = (hostname) => {
    const parts = hostname.split(".").map((part) => Number(part));
    const [first, second] = parts;

    return (
        first === 0 ||
        first === 10 ||
        first === 127 ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        (first === 100 && second >= 64 && second <= 127)
    );
};

const isPrivateIPv6 = (hostname) => {
    const normalized = hostname.toLowerCase();

    return (
        normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:")
    );
};

export function validateImageProxyUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
        throw new ImageProxyError(400, "Missing image URL.");
    }

    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new ImageProxyError(400, "Invalid image URL.");
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new ImageProxyError(400, "Image URL must use HTTP or HTTPS.");
    }

    const hostname = parsed.hostname.replace(/^\[(.*)\]$/, "$1").toLowerCase();
    const ipVersion = net.isIP(hostname);

    if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname === "0.0.0.0" ||
        (ipVersion === 4 && isPrivateIPv4(hostname)) ||
        (ipVersion === 6 && isPrivateIPv6(hostname))
    ) {
        throw new ImageProxyError(400, "Image URL host is not allowed.");
    }

    return parsed.toString();
}

const isAllowedImageContentType = (contentType) => {
    const normalized = contentType.split(";")[0].trim().toLowerCase();

    return (
        normalized.startsWith("image/") ||
        normalized === "application/octet-stream" ||
        normalized === "binary/octet-stream"
    );
};

export async function fetchImageForProxy(rawUrl, fetchImpl = globalThis.fetch) {
    if (!fetchImpl) {
        throw new ImageProxyError(500, "No fetch implementation available.");
    }

    const url = validateImageProxyUrl(rawUrl);
    const response = await fetchImpl(url, {
        headers: {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "User-Agent": "nuzlocke-generator-image-proxy/1.0",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(IMAGE_PROXY_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new ImageProxyError(
            response.status,
            `Image request failed with status ${response.status}.`,
        );
    }

    const contentType =
        response.headers.get("content-type") || "application/octet-stream";

    if (!isAllowedImageContentType(contentType)) {
        throw new ImageProxyError(415, "URL did not return an image.");
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
        throw new ImageProxyError(413, "Image is too large.");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
        throw new ImageProxyError(413, "Image is too large.");
    }

    return {
        body: buffer,
        contentType,
        cacheControl:
            "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    };
}
