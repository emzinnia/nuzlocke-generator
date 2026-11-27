import { describe, expect, it } from "vitest";
import {
    getBackgroundGradient,
    getPokemonBackgroundStyle,
    styleDefaults,
    Types,
} from "utils";

describe("getBackgroundGradient", () => {
    it("returns valid gradient syntax for single and dual types", () => {
        expect(getBackgroundGradient(Types.Grass, Types.Poison, [])).toBe(
            "linear-gradient(to right, #39BF3C, #75226B)",
        );
        expect(getBackgroundGradient(Types.Fire, undefined as never, [])).toBe(
            "linear-gradient(to right, #EB3434, #EB3434)",
        );
    });
});

describe("getPokemonBackgroundStyle", () => {
    it("defaults to the accent background", () => {
        expect(
            getPokemonBackgroundStyle({
                pokemon: { types: [Types.Grass, Types.Poison] },
                style: { ...styleDefaults, accentColor: "#123456" },
            }),
        ).toMatchObject({
            background: "#123456",
            source: "accent",
            usesGameOriginBackground: false,
        });
    });

    it("uses type gradients when selected", () => {
        expect(
            getPokemonBackgroundStyle({
                pokemon: { types: [Types.Grass, Types.Poison] },
                style: { ...styleDefaults, pokemonBackgroundSource: "type" },
            }),
        ).toMatchObject({
            background: "linear-gradient(to right, #39BF3C, #75226B)",
            source: "type",
            usesGameOriginBackground: false,
        });
    });

    it("preserves legacy game-origin background settings", () => {
        expect(
            getPokemonBackgroundStyle({
                pokemon: {
                    gameOfOrigin: "FireRed",
                    types: [Types.Fire, Types.Fire],
                },
                style: {
                    ...styleDefaults,
                    displayGameOriginForBoxedAndDead: true,
                    displayBackgroundInsteadOfBadge: true,
                    pokemonBackgroundSource: undefined as never,
                },
            }),
        ).toMatchObject({
            background: "#ef4e21",
            source: "game-origin",
            usesGameOriginBackground: true,
        });
    });
});
