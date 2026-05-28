import { describe, expect, it } from "vitest";
import { Forme } from "utils";
import { getIconURL } from "../PokemonIcon";

describe("getIconURL", () => {
    it("builds Paldean Tauros icon URLs for each breed", () => {
        expect(
            getIconURL({
                id: "paldean",
                species: "Tauros",
                forme: Forme.Paldean,
            }),
        ).toEqual("icons/pokemon/regular/tauros-paldea.png");
        expect(
            getIconURL({
                id: "paldean-aqua",
                species: "Tauros",
                forme: Forme["Paldean-Aqua"],
            }),
        ).toEqual("icons/pokemon/regular/tauros-paldea-aqua.png");
        expect(
            getIconURL({
                id: "paldean-blaze",
                species: "Tauros",
                forme: Forme["Paldean-Blaze"],
            }),
        ).toEqual("icons/pokemon/regular/tauros-paldea-blaze.png");
    });
});
