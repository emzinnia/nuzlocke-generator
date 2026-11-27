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

    it("can hide game origin for boxed pokemon while the global option is enabled", () => {
        // @ts-expect-error - Test props may not match full interface
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            gameOfOrigin: "Red",
            style: {
                ...styleDefaults,
                displayGameOriginForBoxedAndDead: true,
                displayGameOriginForBoxedPokemon: false,
                displayGameOriginForDeadPokemon: true,
            },
        };

        render(<BoxedPokemonBase {...props} />);

        expect(screen.queryByText("Red")).toBeNull();
    });

    it("shows game origin for boxed pokemon by default when the global option is enabled", () => {
        // @ts-expect-error - Test props may not match full interface
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            gameOfOrigin: "Red",
            style: {
                ...styleDefaults,
                displayGameOriginForBoxedAndDead: true,
            },
        };

        render(<BoxedPokemonBase {...props} />);

        expect(screen.getByText("Red")).toBeTruthy();
    });
});
