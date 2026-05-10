import { describe, expect, it } from "vitest";

import { getPokemonImageBackgroundStyle } from "../getPokemonImageBackgroundStyle";

describe("getPokemonImageBackgroundStyle", () => {
    it("centers sprite backgrounds without changing existing sizing modes", () => {
        expect(
            getPokemonImageBackgroundStyle({
                spritesMode: true,
                scaleSprites: false,
                teamImages: "standard",
            }),
        ).toEqual({
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
        });

        expect(
            getPokemonImageBackgroundStyle({
                spritesMode: true,
                scaleSprites: true,
                teamImages: "standard",
            }),
        ).toEqual({
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "auto",
        });
    });

    it("keeps dream world artwork contained and centered", () => {
        expect(
            getPokemonImageBackgroundStyle({
                spritesMode: false,
                scaleSprites: false,
                teamImages: "dream world",
            }),
        ).toEqual({
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
        });
    });
});
