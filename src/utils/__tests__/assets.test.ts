import { describe, expect, it } from "vitest";
import { getAssetCssUrl, getAssetUrl, normalizeAssetPath } from "utils/assets";

describe("asset URL helpers", () => {
    it("keeps existing same-origin paths when no external storage base is set", () => {
        expect(getAssetUrl("./img/pikachu.jpg", "")).toBe("img/pikachu.jpg");
        expect(getAssetCssUrl("icons/pokemon/regular/pikachu.png", "")).toBe(
            "url(icons/pokemon/regular/pikachu.png)",
        );
    });

    it("prefixes local image and sprite paths with the external storage origin", () => {
        expect(
            getAssetUrl(
                "img/pikachu.jpg",
                "https://assets.example.com/nuzlocke/",
            ),
        ).toBe("https://assets.example.com/nuzlocke/img/pikachu.jpg");
        expect(
            getAssetCssUrl(
                "/icons/pokemon/regular/pikachu.png",
                "https://assets.example.com/nuzlocke",
            ),
        ).toBe(
            "url(https://assets.example.com/nuzlocke/icons/pokemon/regular/pikachu.png)",
        );
    });

    it("does not rewrite already-absolute or data URLs", () => {
        expect(
            getAssetUrl(
                "https://img.pokemondb.net/sprites/pikachu.png",
                "https://assets.example.com",
            ),
        ).toBe("https://img.pokemondb.net/sprites/pikachu.png");
        expect(
            getAssetUrl(
                "data:image/png;base64,abc",
                "https://assets.example.com",
            ),
        ).toBe("data:image/png;base64,abc");
    });

    it("normalizes root-relative and dot-relative asset paths", () => {
        expect(normalizeAssetPath("./img/pikachu.jpg")).toBe("img/pikachu.jpg");
        expect(normalizeAssetPath("/icons/pokemon/unknown.png")).toBe(
            "icons/pokemon/unknown.png",
        );
    });
});
