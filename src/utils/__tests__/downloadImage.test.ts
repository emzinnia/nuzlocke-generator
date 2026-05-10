import {
    dataUrlToBlob,
    downloadImageDataUrl,
    isAndroidUserAgent,
} from "../downloadImage";

describe("downloadImage", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("detects Android user agents", () => {
        expect(isAndroidUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe(
            true,
        );
        expect(isAndroidUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS)")).toBe(
            false,
        );
    });

    it("converts image data URLs to blobs", () => {
        const blob = dataUrlToBlob("data:image/png;base64,aGVsbG8=");

        expect(blob.type).toBe("image/png");
        expect(blob.size).toBe(5);
    });

    it("uses Android file sharing when available", async () => {
        const share = vi.fn().mockResolvedValue(undefined);
        const canShare = vi.fn().mockReturnValue(true);
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click");

        const result = await downloadImageDataUrl(
            "data:image/png;base64,aGVsbG8=",
            "nuzlocke.png",
            {
                navigator: {
                    canShare,
                    share,
                    userAgent: "Mozilla/5.0 (Linux; Android 14)",
                },
            },
        );

        expect(result).toBe("shared");
        expect(canShare).toHaveBeenCalledWith({
            files: [expect.any(File)],
            title: "nuzlocke.png",
            text: "Nuzlocke result image",
        });
        expect(share).toHaveBeenCalledWith({
            files: [expect.any(File)],
            title: "nuzlocke.png",
            text: "Nuzlocke result image",
        });
        expect(click).not.toHaveBeenCalled();
    });

    it("falls back to an object URL download when Android sharing fails", async () => {
        const objectUrl = "blob:https://nuzlocke-generator.test/fallback";
        const share = vi.fn().mockRejectedValue(new Error("Share failed"));
        const createObjectURL = vi.fn().mockReturnValue(objectUrl);
        const revokeObjectURL = vi.fn();
        const setTimeout = vi.fn((callback: () => void) => {
            callback();
            return 1;
        });
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click");

        const result = await downloadImageDataUrl(
            "data:image/png;base64,aGVsbG8=",
            "nuzlocke.png",
            {
                navigator: {
                    share,
                    userAgent: "Mozilla/5.0 (Linux; Android 14)",
                },
                setTimeout: setTimeout as unknown as Window["setTimeout"],
                url: { createObjectURL, revokeObjectURL },
            },
        );

        expect(result).toBe("downloaded");
        expect(share).toHaveBeenCalledWith({
            files: [expect.any(File)],
            title: "nuzlocke.png",
            text: "Nuzlocke result image",
        });
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
    });

    it("falls back to an object URL download", async () => {
        const objectUrl = "blob:https://nuzlocke-generator.test/result";
        const createObjectURL = vi.fn().mockReturnValue(objectUrl);
        const revokeObjectURL = vi.fn();
        const setTimeout = vi.fn((callback: () => void) => {
            callback();
            return 1;
        });
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click");

        const result = await downloadImageDataUrl(
            "data:image/png;base64,aGVsbG8=",
            "nuzlocke.png",
            {
                navigator: {
                    userAgent: "Mozilla/5.0 (Linux; Android 14)",
                },
                setTimeout: setTimeout as unknown as Window["setTimeout"],
                url: { createObjectURL, revokeObjectURL },
            },
        );

        expect(result).toBe("downloaded");
        expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(click).toHaveBeenCalledTimes(1);
        expect(document.body.querySelector("a")).toBeNull();
        expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
    });
});
