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
});
