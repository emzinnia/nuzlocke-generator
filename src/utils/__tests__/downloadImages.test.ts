import { describe, expect, it } from "vitest";
import {
    DEFAULT_CORS_PROXY_BASE,
    TRANSPARENT_IMAGE_PLACEHOLDER,
    getCorsProxyUrl,
    getDomToImageOptions,
    isRemoteImageUrl,
} from "../downloadImages";

describe("@src/utils/downloadImages.ts", () => {
    it("detects only http(s) image URLs as remote", () => {
        expect(isRemoteImageUrl("https://example.com/pokemon.png")).toBe(true);
        expect(isRemoteImageUrl("http://example.com/pokemon.png")).toBe(true);
        expect(isRemoteImageUrl("data:image/png;base64,abc")).toBe(false);
        expect(isRemoteImageUrl("./img/checkpoints/boulder-badge.png")).toBe(
            false,
        );
    });

    it("builds CORS proxy URLs for dom-to-image and direct fetches", () => {
        const url = "https://cdn2.bulbagarden.net/upload/d/d4/Legend_Ribbon.png";

        expect(getCorsProxyUrl(url)).toBe(`${DEFAULT_CORS_PROXY_BASE}/${url}`);
        expect(getDomToImageOptions()).toEqual({
            cacheBust: true,
            imagePlaceholder: TRANSPARENT_IMAGE_PLACEHOLDER,
            corsImg: {
                url: `${DEFAULT_CORS_PROXY_BASE}/#{cors}`,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
        });
    });
});

