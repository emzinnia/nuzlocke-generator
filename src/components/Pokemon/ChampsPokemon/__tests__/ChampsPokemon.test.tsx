import * as React from "react";
import { render } from "@testing-library/react";
import { ChampsPokemon } from "../ChampsPokemon";

vi.mock("components/Pokemon/PokemonIcon/PokemonIcon", () => ({
    PokemonIcon: (props: any) => <div data-testid="pokemon-icon" {...props} />,
}));

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({ children }: any) => <>{children("image-url")}</>,
}));

const baseProps = {
    id: "c1",
    species: "Pikachu",
    gameOfOrigin: "Red",
    nickname: "Sparky",
    level: 50,
    gender: "m",
};

describe("<ChampsPokemon />", () => {
    it("renders sprite when useSprites is true", () => {
        const { container } = render(<ChampsPokemon {...baseProps} useSprites />);

        expect(container.querySelector(".champs-pokemon-image")?.tagName).toBe(
            "IMG",
        );
    });

    it("shows nickname, gender, and level when enabled", () => {
        const { getByText, getByTestId } = render(
            <ChampsPokemon
                {...baseProps}
                showNickname
                showGender
                showLevel
                useSprites={false}
            />,
        );

        expect(getByTestId("pokemon-icon")).toBeTruthy();
        expect(getByText("Sparky")).toBeTruthy();
        expect(getByText(/Lv 50/)).toBeTruthy();
    });
});

