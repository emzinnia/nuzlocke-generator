import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { listOfPokemon } from "utils/data/listOfPokemon";

const toTcgFilename = (species: string) =>
    `${species.replace(/\s/g, "").replace(/'/g, "").toLowerCase()}.jpg`;

describe("TCG image assets", () => {
    it("includes local assets for every Scarlet/Violet Pokemon", () => {
        const paldeanPokemon = listOfPokemon.slice(
            listOfPokemon.indexOf("Sprigatito"),
        );
        const missingAssets = paldeanPokemon
            .map((species) => ({
                species,
                filename: toTcgFilename(species),
            }))
            .filter(({ filename }) => {
                return !existsSync(join(process.cwd(), "src/img/tcg", filename));
            });

        expect(missingAssets).toEqual([]);
    });
});
