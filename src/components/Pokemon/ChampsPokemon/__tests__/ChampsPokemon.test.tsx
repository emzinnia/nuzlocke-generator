import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "utils/testUtils";

import { ChampsPokemon } from "../ChampsPokemon";

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({
        children,
    }: {
        children: (image: string) => JSX.Element;
    }) => <>{children("url(sprite.png)")}</>,
}));

describe(ChampsPokemon.name, () => {
    it("renders sprite-mode champion images without an empty img element", () => {
        const { container } = render(
            <ChampsPokemon
                id="champ-charizard"
                species="Charizard"
                nickname="Flint"
                gameOfOrigin="Yellow"
                useSprites
            />,
        );

        const sprite = screen.getByRole("img", { name: "Flint sprite" });
        expect(sprite.tagName).toBe("SPAN");
        expect((sprite as HTMLElement).style.backgroundImage).toBe(
            "url(\"sprite.png\")",
        );
        expect(container.querySelector("img.champs-pokemon-image")).toBeNull();
    });
});
