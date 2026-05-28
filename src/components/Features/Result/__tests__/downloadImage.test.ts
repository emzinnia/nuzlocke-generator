import {
    downloadResultAsPng,
    getImportedStylesheetUrls,
} from "../downloadImage";

const { toPngMock } = vi.hoisted(() => ({
    toPngMock: vi.fn(),
}));

vi.mock("@emmaramirez/dom-to-image", () => ({
    domToImage: {
        toPng: toPngMock,
    },
}));

describe("downloadResultAsPng", () => {
    const originalClick = HTMLAnchorElement.prototype.click;

    beforeEach(() => {
        document.head.innerHTML = "";
        document.body.innerHTML = "";
        vi.restoreAllMocks();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                text: () =>
                    Promise.resolve(
                        "@font-face { font-family: Karla; src: url(https://fonts.gstatic.com/karla.woff2); }",
                    ),
            }),
        );
        HTMLAnchorElement.prototype.click = vi.fn();
        toPngMock.mockResolvedValue("data:image/png;base64,abc");
    });

    afterEach(() => {
        HTMLAnchorElement.prototype.click = originalClick;
        vi.unstubAllGlobals();
    });

    it("inlines imported custom font CSS before rendering the image", async () => {
        const node = document.createElement("div");
        document.body.appendChild(node);

        toPngMock.mockImplementation(async () => {
            expect(
                document.querySelector("[data-ng-image-font-imports]")
                    ?.textContent,
            ).toContain("@font-face");
            return "data:image/png;base64,abc";
        });

        await downloadResultAsPng({
            node,
            customCSS:
                '@import url("https://fonts.googleapis.com/css2?family=Karla"); .result { font-family: Karla; }',
            filename: "test.png",
        });

        expect(fetch).toHaveBeenCalledWith(
            "https://fonts.googleapis.com/css2?family=Karla",
        );
        expect(toPngMock).toHaveBeenCalledWith(node, { corsImage: true });
        expect(document.querySelector("[data-ng-image-font-imports]")).toBeNull();
        expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
});

describe("getImportedStylesheetUrls", () => {
    it("returns unique absolute http imports", () => {
        expect(
            getImportedStylesheetUrls(
                '@import url("/fonts.css"); @import "https://fonts.example/css"; @import url("/fonts.css");',
                "https://example.test/page",
            ),
        ).toEqual([
            "https://example.test/fonts.css",
            "https://fonts.example/css",
        ]);
    });
});
