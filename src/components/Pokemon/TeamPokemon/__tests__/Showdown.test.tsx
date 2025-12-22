/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { render } from "@testing-library/react";
import { Showdown } from "../Showdown";

vi.mock("utils", async (orig) => {
    const mod = await orig();
    return {
        ...mod,
        getPokemonImage: () => "pokemon.png",
        stripURLCSS: (url: string) => url,
    };
});

const pokemon = {
    species: "Gengar",
    nickname: "Spooky",
    gender: "m",
    item: "Leftovers",
    ability: "Cursed Body",
    level: 42,
    shiny: true,
    nature: "Bold",
    moves: ["Shadow Ball", "Sludge Bomb"],
} as any;

const style = { template: "Default" } as any;
const editor = {} as any;
const game = { name: "Red" } as any;

describe("<Showdown />", () => {
    it("renders showdown summary with image and moves", () => {
        const { getByAltText, getByText } = render(
            <Showdown pokemon={pokemon} style={style} editor={editor} game={game} />,
        );

        expect(getByAltText("Spooky").getAttribute("src")).toBe("pokemon.png");
        expect(getByText(/Shadow Ball/)).toBeTruthy();
        expect(getByText(/Level: 42/)).toBeTruthy();
    });
});

