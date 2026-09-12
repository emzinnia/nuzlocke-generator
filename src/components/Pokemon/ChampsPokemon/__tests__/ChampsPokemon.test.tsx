import * as React from "react";
import { vi } from "vitest";
import { render, screen } from "utils/testUtils";
import { Types } from "utils";
import { ChampsPokemon } from "../ChampsPokemon";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: (props: { className?: string }) => (
        <div data-testid="pokemon-icon" className={props.className} />
    ),
}));

describe("ChampsPokemon", () => {
    it("renders the monolocke type icon when one is selected", () => {
        render(
            <ChampsPokemon
                id="champ-1"
                species="Charizard"
                monolockeType={Types.Fire}
                gameOfOrigin="Red"
            />,
        );

        const icon = screen.getByAltText("Monolocke: Fire");
        expect(icon).toBeTruthy();
        expect(icon.getAttribute("src")).toBe("icons/tera/fire.png");
    });

    it("omits the monolocke type icon when it is not set", () => {
        render(
            <ChampsPokemon
                id="champ-1"
                species="Charizard"
                monolockeType={"None" as Types}
                gameOfOrigin="Red"
            />,
        );

        expect(screen.queryByAltText(/Monolocke:/)).toBeNull();
    });
});
