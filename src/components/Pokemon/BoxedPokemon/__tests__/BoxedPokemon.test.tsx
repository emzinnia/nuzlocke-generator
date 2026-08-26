import * as React from "react";
import { BoxedPokemonBase, BoxedPokemonProps } from "../BoxedPokemon";
import { render, screen, waitFor } from "utils/testUtils";
import { PokemonFixtures } from "utils/fixtures";
import { styleDefaults } from "utils";

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({
        children,
    }: {
        children: (image: string) => React.ReactNode;
    }) => <>{children("https://img.test/pikachu.png")}</>,
}));

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

    it("renders artwork when boxed artwork is enabled", async () => {
        const props: BoxedPokemonProps = {
            ...PokemonFixtures.Pikachu,
            editor: { minimized: false },
            game: { name: "Red", customName: "" },
            selectPokemon: vi.fn(),
            style: {
                ...styleDefaults,
                useArtworkForBoxedPokemon: true,
            },
        };

        render(<BoxedPokemonBase {...props} />);

        await waitFor(() => screen.getByTestId("boxed-pokemon-art"));
        expect(screen.getByTestId("boxed-pokemon-art").getAttribute("src")).toBe(
            "https://img.test/pikachu.png",
        );
    });
});
