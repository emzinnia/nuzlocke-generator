import * as React from "react";
import { vi } from "vitest";
import { BoxedPokemonBase, BoxedPokemonProps } from "../BoxedPokemon";
import { render, screen, waitFor } from "utils/testUtils";
import { PokemonFixtures } from "utils/fixtures";
import { styleDefaults } from "utils";
describe(BoxedPokemonBase.name, () => {
    it("renders a Boxed Pokemon", async () => {
        // @ts-expect-error - Test props may not match full interface
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            style: styleDefaults,
        };

        render(<BoxedPokemonBase {...props} />);

        await waitFor(() => screen.getByTestId("boxed-pokemon-name"));
        expect(screen.getByTestId("boxed-pokemon-name").textContent).toContain(
            PokemonFixtures.Pikachu.nickname,
        );
    });

    it("uses type-colored backgrounds when selected", () => {
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            selectPokemon: vi.fn(),
            style: { ...styleDefaults, pokemonBackgroundSource: "type" },
        };

        const { container } = render(<BoxedPokemonBase {...props} />);

        const boxedPokemon = container.querySelector(
            ".boxed-pokemon-container",
        ) as HTMLElement;
        expect(boxedPokemon.style.backgroundImage).toContain("#E3E039");
    });
});
