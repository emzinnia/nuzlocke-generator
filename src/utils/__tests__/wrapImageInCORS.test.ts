import { describe, it, expect, vi, afterEach } from "vitest";
import {
    getCorsImageProxyFetchUrl,
    getDomToImageCorsOptions,
    wrapImageInCORS,
    wrapImageInCORSPlain,
} from "../wrapImageInCORS";

const remoteUrl = "https://example.com/image.png?token=a&size=large";
const configuredProxyBase = import.meta.env.VITE_CORS_ANYWHERE_URL?.trim();
const expectedProxyBase = configuredProxyBase?.replace(/\/+$/, "");
const expectedFetchUrl = expectedProxyBase
    ? `${expectedProxyBase}/${remoteUrl}`
    : `/image-proxy?url=${encodeURIComponent(remoteUrl)}`;
const expectedDomToImageOptions = expectedProxyBase
    ? {
          cacheBust: true,
          corsImg: {
              method: "GET",
              url: `${expectedProxyBase}/#{cors}`,
          },
      }
    : {
          cacheBust: true,
          corsImg: {
              method: "POST",
              url: "/image-proxy",
              headers: { "Content-Type": "application/json" },
              data: { url: "#{cors}" },
          },
      };

describe("wrapImageInCORS", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("uses the configured image proxy fetch URL", () => {
        expect(getCorsImageProxyFetchUrl(remoteUrl)).toBe(expectedFetchUrl);
    });

    it("builds dom-to-image proxy options", () => {
        expect(getDomToImageCorsOptions()).toEqual(expectedDomToImageOptions);
    });

    it("returns a plain data URL fetched through the image proxy", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response("abc", {
                status: 200,
                statusText: "OK",
                headers: { "Content-Type": "image/png" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);

        await expect(wrapImageInCORSPlain(remoteUrl)).resolves.toBe(
            "data:image/png;base64,YWJj",
        );
        expect(fetchMock).toHaveBeenCalledWith(
            expectedFetchUrl,
            {
                mode: "cors",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
        );
    });

    it("wraps the proxied data URL for CSS backgrounds", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response("abc", {
                    status: 200,
                    statusText: "OK",
                    headers: { "Content-Type": "image/png" },
                }),
            ),
        );

        await expect(wrapImageInCORS(remoteUrl)).resolves.toBe(
            "url(data:image/png;base64,YWJj)",
        );
    });

    it("falls back to the direct URL when the image proxy fails", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

        await expect(wrapImageInCORSPlain(remoteUrl)).resolves.toBe(remoteUrl);
        await expect(wrapImageInCORS(remoteUrl)).resolves.toBe(
            `url(${remoteUrl})`,
        );
    });
});
