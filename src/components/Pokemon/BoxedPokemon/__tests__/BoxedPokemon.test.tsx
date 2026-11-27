import * as React from "react";
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

    it("hides the pokemon name when configured", async () => {
        // @ts-expect-error - Test props may not match full interface
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            level: 25,
            style: { ...styleDefaults, hidePokemonNames: true },
        };

        render(<BoxedPokemonBase {...props} />);

        await waitFor(() => screen.getByTestId("boxed-pokemon-name"));
        const text = screen.getByTestId("boxed-pokemon-name").textContent;
        expect(text).not.toContain(PokemonFixtures.Pikachu.nickname);
        expect(text).toContain("lv. 25");
    });
});
