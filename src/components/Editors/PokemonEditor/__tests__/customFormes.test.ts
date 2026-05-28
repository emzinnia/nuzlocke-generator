import { describe, expect, it } from "vitest";
import { Types } from "utils";
import { Pokemon } from "models";
import { getFormeInputConfig } from "../CurrentPokemonEdit";
import { createEdit } from "../CurrentPokemonInput";

describe("custom Pokemon formes", () => {
    it("uses a text input for custom species formes", () => {
        expect(getFormeInputConfig("zinunas")).toEqual({
            type: "text",
            options: undefined,
        });
    });

    it("keeps canonical species on the forme select", () => {
        expect(getFormeInputConfig("Tauros")).toMatchObject({
            type: "select",
            options: ["Normal", "Paldean", "Paldean-Aqua", "Paldean-Blaze"],
        });
    });

    it("does not reset custom species types when editing a custom forme", () => {
        const pokemon = {
            species: "zinunas",
            types: [Types.Shadow, "None" as Types],
        } as Pokemon;

        expect(
            createEdit({
                inputName: "forme",
                value: "Speed",
                pokemon,
                edit: { forme: "Speed" },
            }),
        ).toEqual({ forme: "Speed" });
    });
});
