import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pokemon } from "models";
import { styleDefaults, Types } from "utils";
import {
    getCustomItemImageScale,
    PokemonItem,
} from "../PokemonItem";

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({ children }) => children("custom-item.png"),
}));

const basePokemon: Pokemon = {
    id: "item-test",
    species: "Pikachu",
    item: "Lucky Egg",
    customItemImage: "custom-lucky-egg",
    types: [Types.Electric, Types.Electric],
};

describe(PokemonItem.name, () => {
    it("renders custom item images at the default scale", () => {
        render(
            <PokemonItem
                pokemon={basePokemon}
                style={styleDefaults}
                customTypes={[]}
            />,
        );

        const image = screen.getByAltText("Lucky Egg");
        expect(image.style.width).toBe("100%");
        expect(image.style.height).toBe("100%");
    });

    it("applies a custom item image scale percentage", () => {
        render(
            <PokemonItem
                pokemon={{ ...basePokemon, customItemImageScale: 50 }}
                style={styleDefaults}
                customTypes={[]}
            />,
        );

        const image = screen.getByAltText("Lucky Egg");
        expect(image.style.width).toBe("50%");
        expect(image.style.height).toBe("50%");
    });
});

describe(getCustomItemImageScale.name, () => {
    it("defaults blank or invalid scales and clamps out-of-range values", () => {
        expect(getCustomItemImageScale(undefined)).toBe(100);
        expect(getCustomItemImageScale("")).toBe(100);
        expect(getCustomItemImageScale("not a number")).toBe(100);
        expect(getCustomItemImageScale(-10)).toBe(1);
        expect(getCustomItemImageScale(250)).toBe(200);
    });
});
