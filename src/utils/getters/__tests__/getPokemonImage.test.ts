import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoisted mocks so they are available inside vi.mock factories (Vitest hoists vi.mock).
const mocks = vi.hoisted(() => {
    return {
        getImages: vi.fn(() => Promise.resolve([] as Array<{ name: string; image: string }>)),
        wrapImageInCORS: vi.fn(async (url: string) => `cors(${url})`),
        speciesToNumber: vi.fn((species: string) => {
            const map: Record<string, number> = {
                Ditto: 132,
                Pikachu: 25,
                Unfezant: 521,
                Gyarados: 130,
                Dugtrio: 51,
                Indeedee: 876,
                Basculegion: 902,
                "Mime Jr.": 439,
                "Mr. Mime": 122,
            };
            return map[species] ?? 0;
        }),
        getForme: vi.fn((forme?: string) => (forme ? `-${forme}` : "")),
        addForme: vi.fn((species: string, forme?: string) =>
            species ? `${species}${forme ? `-${forme}` : ""}` : "",
        ),
        normalizeSpeciesName: vi.fn((species: string) =>
            species
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\./g, "")
                .replace(/'/g, ""),
        ),
        capitalize: vi.fn((s: string) => s),
    };
});

vi.mock("components", () => ({
    // Runtime placeholder: this import is only used for typing in many places,
    // but the file imports it as a value.
    GenderElementProps: {},
}));

vi.mock("models", () => ({
    // Runtime placeholders for value imports that are used as types.
    Editor: {},
    Pokemon: {},
}));

vi.mock("components/Common/Shared/ImagesDrawer", () => ({
    getImages: mocks.getImages,
}));

vi.mock("utils", () => ({
    // `getIconFormeSuffix` imports `Forme` at runtime, so provide a minimal mapping.
    Forme: {
        Normal: "normal",
        Alolan: "alolan",
        Galarian: "galarian",
    },
    significantGenderDifferenceList: ["Pikachu"],
    speciesToNumber: mocks.speciesToNumber,
    getForme: mocks.getForme,
    addForme: mocks.addForme,
    wrapImageInCORS: mocks.wrapImageInCORS,
    isRemoteImageUrl: (url: string) => /^https?:\/\//i.test(url),
    normalizeSpeciesName: mocks.normalizeSpeciesName,
    capitalize: mocks.capitalize,
}));

import { getPokemonImage, stripURLCSS } from "../getPokemonImage";
import type { GetPokemonImage } from "../getPokemonImage";

type ImageStyle = NonNullable<GetPokemonImage["style"]>;
type ImageGame = NonNullable<GetPokemonImage["name"]>;
type ImageForme = NonNullable<GetPokemonImage["forme"]>;
type ImageGender = NonNullable<GetPokemonImage["gender"]>;
type ImageEditor = NonNullable<GetPokemonImage["editor"]>;

const imageStyle = (style: Partial<ImageStyle>): ImageStyle =>
    style as ImageStyle;
const imageGame = (name: ImageGame): ImageGame => name;
const imageForme = (forme: ImageForme): ImageForme => forme;
const imageGender = (gender: ImageGender): ImageGender => gender;
const imageEditor = (editor: Partial<ImageEditor>): ImageEditor =>
    editor as ImageEditor;

describe("@src/utils/getters/getPokemonImage.ts", () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn> | undefined;

    beforeEach(() => {
        // `getIconFormeSuffix` currently logs; silence for deterministic tests.
        consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        mocks.getImages.mockReset();
        mocks.wrapImageInCORS.mockClear();
        mocks.speciesToNumber.mockClear();
        mocks.getForme.mockClear();
        mocks.addForme.mockClear();
        mocks.normalizeSpeciesName.mockClear();
        mocks.capitalize.mockClear();
    });

    afterEach(() => {
        consoleLogSpy?.mockRestore();
    });

    describe("customImage handling", () => {
        it("returns a stored image when customImage matches an image drawer entry", async () => {
            mocks.getImages.mockResolvedValueOnce([
                { name: "my-image", image: "data:image/png;base64,abc" },
            ]);

            const result = await getPokemonImage({
                customImage: "my-image",
                species: "Pikachu",
            });

            expect(result).toBe("url(data:image/png;base64,abc)");
            expect(mocks.wrapImageInCORS).not.toHaveBeenCalled();
        });

        it("wraps remote URLs (http*) with CORS helper", async () => {
            mocks.getImages.mockResolvedValueOnce([]);

            const result = await getPokemonImage({
                customImage: "http://example.com/image.png",
                species: "Pikachu",
            });

            expect(mocks.wrapImageInCORS).toHaveBeenCalledWith(
                "http://example.com/image.png",
            );
            expect(result).toBe("cors(http://example.com/image.png)");
        });

        it("returns raw url(...) for non-http custom images", async () => {
            mocks.getImages.mockResolvedValueOnce([]);

            const result = await getPokemonImage({
                customImage: "img/custom.png",
                species: "Pikachu",
            });

            expect(result).toBe("url(img/custom.png)");
            expect(mocks.wrapImageInCORS).not.toHaveBeenCalled();
        });
    });

    it("returns temtem sprites when temtemMode is enabled", async () => {
        const result = await getPokemonImage({
            editor: imageEditor({ temtemMode: true }),
            species: "  Platypet  ",
        });

        expect(result).toBe("url(img/temtem/Platypet.png)");
    });

    it("returns egg image when egg is true", async () => {
        const result = await getPokemonImage({
            egg: true,
            species: "Pikachu",
        });

        expect(result).toBe("url(img/egg.jpg)");
    });

    describe("spritesMode (remote sprite URLs)", () => {
        it("builds serebii non-shiny sprite URL for BW-era games and wraps it", async () => {
            const result = await getPokemonImage({
                species: "Pikachu",
                forme: imageForme("Alolan"),
                name: imageGame("Black"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });

            const expectedUrl =
                "https://www.serebii.net/blackwhite/pokemon/025-Alolan.png";
            expect(mocks.wrapImageInCORS).toHaveBeenCalledWith(expectedUrl);
            expect(result).toBe(`cors(${expectedUrl})`);
        });

        it("builds serebii shiny sprite URL for BW-era games and wraps it", async () => {
            const result = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Black"),
                style: imageStyle({ spritesMode: true }),
                shiny: true,
            });

            const expectedUrl = "https://www.serebii.net/Shiny/BW/025.png";
            expect(mocks.wrapImageInCORS).toHaveBeenCalledWith(expectedUrl);
            expect(result).toBe(`cors(${expectedUrl})`);
        });

        it("builds Scarlet/Violet sprite URLs and wraps them", async () => {
            const nonShiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Scarlet"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });
            const shiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Violet"),
                style: imageStyle({ spritesMode: true }),
                shiny: true,
            });

            expect(nonShiny).toBe(
                "cors(https://serebii.net/scarletviolet/pokemon/new/025.png)",
            );
            expect(shiny).toBe(
                "cors(https://serebii.net/Shiny/SV/new/025.png)",
            );
        });

        it("builds DP/HGSS sprite URLs and wraps them", async () => {
            const nonShiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Diamond"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });
            const shiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("HeartGold"),
                style: imageStyle({ spritesMode: true }),
                shiny: true,
            });

            expect(nonShiny).toBe(
                "cors(https://www.serebii.net/pokearth/sprites/dp/025.png)",
            );
            expect(shiny).toBe("cors(https://www.serebii.net/Shiny/DP/025.png)");
        });

        it("builds FRLG sprite URLs via pokemondb and wraps them", async () => {
            const nonShiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("FireRed"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });
            const shiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("LeafGreen"),
                style: imageStyle({ spritesMode: true }),
                shiny: true,
            });

            expect(mocks.normalizeSpeciesName).toHaveBeenCalledWith("Pikachu");
            expect(nonShiny).toBe(
                "cors(https://img.pokemondb.net/sprites/firered-leafgreen/normal/pikachu.png)",
            );
            expect(shiny).toBe(
                "cors(https://img.pokemondb.net/sprites/firered-leafgreen/shiny/pikachu.png)",
            );
        });

        it("builds Sword/Shield sprite URLs and wraps them", async () => {
            const nonShiny = await getPokemonImage({
                species: "Pikachu",
                forme: imageForme("Alolan"),
                name: imageGame("Sword"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });
            const shiny = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Shield"),
                style: imageStyle({ spritesMode: true }),
                shiny: true,
            });

            expect(nonShiny).toBe(
                "cors(https://www.serebii.net/swordshield/pokemon/025-Alolan.png)",
            );
            expect(shiny).toBe(
                "cors(https://www.serebii.net/Shiny/SWSH/025.png)",
            );
        });

        it("uses generic serebii URL builder for other games when spritesMode is true", async () => {
            const result = await getPokemonImage({
                species: "Pikachu",
                name: imageGame("Green"),
                style: imageStyle({ spritesMode: true }),
                shiny: false,
            });

            expect(result).toBe(
                "cors(https://www.serebii.net/green/pokemon/025.png)",
            );
        });
    });

    describe("teamImages modes (local assets)", () => {
        it("returns sugimori female folder for known gender-dimorphic species", async () => {
            const result = await getPokemonImage({
                species: "Unfezant",
                forme: imageForme("Galarian"),
                gender: imageGender("Female"),
                style: imageStyle({ teamImages: "sugimori" }),
            });

            expect(result).toBe("url(img/sugimori/female/521-galarian.png)");
        });

        it("returns sugimori base folder for other species", async () => {
            const result = await getPokemonImage({
                species: "Pikachu",
                forme: imageForme("Galarian"),
                style: imageStyle({ teamImages: "sugimori" }),
            });

            expect(result).toBe("url(img/sugimori/25-galarian.png)");
        });

        it("returns dream world SVGs (falls back to 1 when no number)", async () => {
            const result = await getPokemonImage({
                species: "DoesNotExist",
                style: imageStyle({ teamImages: "dream world" }),
            });

            expect(result).toBe("url(img/dw/1.svg)");
        });

        it("returns shuffle assets with Mime Jr. special-cased", async () => {
            const result = await getPokemonImage({
                species: "Mime Jr.",
                style: imageStyle({ teamImages: "shuffle" }),
            });

            expect(result).toBe("url(img/shuffle/mime-jr.png)");
        });

        it("returns tcg assets, adding -f for significant gender differences", async () => {
            const result = await getPokemonImage({
                species: "Pikachu",
                gender: imageGender("Female"),
                style: imageStyle({ teamImages: "tcg" }),
            });

            expect(result).toBe("url(img/tcg/pikachu-f.jpg)");
        });
    });

    describe("stopgaps / edge cases", () => {
        it("uses explicit stopgap for shiny Alolan Dugtrio", async () => {
            const result = await getPokemonImage({
                species: "Dugtrio",
                forme: imageForme("Alolan"),
                shiny: true,
            });
            expect(result).toBe("url(img/alolan-dugtrio-shiny.jpg)");
        });

        it("uses explicit stopgap for shiny Gyarados", async () => {
            const result = await getPokemonImage({
                species: "Gyarados",
                shiny: true,
            });
            expect(result).toBe("url(img/gyarados-shiny.jpg)");
        });

        it("uses explicit stopgap for Indeedee male", async () => {
            const result = await getPokemonImage({
                species: "Indeedee",
                gender: imageGender("Male"),
            });
            expect(result).toBe("url(img/indeedee-m.jpg)");
        });

        it("uses explicit stopgap for Basculegion female", async () => {
            const result = await getPokemonImage({
                species: "Basculegion",
                gender: imageGender("Female"),
            });
            expect(result).toBe("url(img/basculegion-f.jpg)");
        });
    });

    describe("default local jpg fallback", () => {
        it("uses missingno when species is empty/undefined", async () => {
            const result = await getPokemonImage({});
            expect(result).toBe("url(img/missingno.jpg)");
        });

        it("normalizes species into img/<name>.jpg with forme applied via addForme", async () => {
            const result = await getPokemonImage({
                species: "Mr. Mime",
                forme: imageForme("Galarian"),
            });

            // The base normalizer in getPokemonImage keeps '.' but lowercases the final string.
            expect(mocks.addForme).toHaveBeenCalledWith(
                "Mr.-Mime",
                "Galarian",
            );
            expect(result).toBe("url(img/mr.-mime-galarian.jpg)");
        });
    });

    describe("stripURLCSS", () => {
        it("strips url(...) wrapper", () => {
            expect(stripURLCSS("url(img/pikachu.jpg)")).toBe("img/pikachu.jpg");
        });
    });
});
