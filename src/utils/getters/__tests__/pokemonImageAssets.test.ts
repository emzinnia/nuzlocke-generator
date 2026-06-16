import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { mapTrainerImage } from "utils/formatters/mapTrainerImage";
import { getPokemonImage, stripURLCSS } from "../getPokemonImage";

const repoAssetExists = (assetPath: string) =>
    existsSync(path.join(process.cwd(), "src", assetPath));

const imageCases = [
    {
        label: "standard Mr. Mime",
        options: { species: "Mr. Mime" },
    },
    {
        label: "shuffle Mr. Mime",
        options: {
            species: "Mr. Mime",
            style: { teamImages: "shuffle" },
        },
    },
    {
        label: "standard Mime Jr.",
        options: { species: "Mime Jr." },
    },
    {
        label: "Sugimori Hitmontop",
        options: {
            species: "Hitmontop",
            style: { teamImages: "sugimori" },
        },
    },
    {
        label: "Sugimori Galarian Darumaka",
        options: {
            species: "Darumaka",
            forme: "Galarian",
            style: { teamImages: "sugimori" },
        },
    },
    {
        label: "legacy Amped Toxtricity",
        options: { species: "Toxtricity", forme: "Amped" },
    },
    {
        label: "legacy Low-Key Toxtricity",
        options: { species: "Toxtricity", forme: "Low-Key" },
    },
    {
        label: "Sugimori Low-Key Toxtricity",
        options: {
            species: "Toxtricity",
            forme: "Low-Key",
            style: { teamImages: "sugimori" },
        },
    },
    {
        label: "standard Skitty",
        options: { species: "Skitty" },
    },
];

describe("Pokemon image asset paths", () => {
    it.each(imageCases)(
        "resolves $label to an existing local asset",
        async ({ options }) => {
            const image = await getPokemonImage(
                options as Parameters<typeof getPokemonImage>[0],
            );
            const assetPath = stripURLCSS(image);

            expect(assetPath).not.toContain(",");
            expect(repoAssetExists(assetPath)).toBe(true);
        },
    );

    it("resolves the Sun trainer image to an existing local asset", () => {
        const assetPath = mapTrainerImage("Sun");

        expect(assetPath).toBe("img/sun.png");
        expect(repoAssetExists(assetPath)).toBe(true);
    });
});
