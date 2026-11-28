import * as React from "react";
import { DeadPokemon } from "../DeadPokemon2";
import { generateEmptyPokemon } from "utils";
import { render, screen } from "utils/testUtils";
import { TestProvider } from "utils/TestProvider";

const poke = {
    ...generateEmptyPokemon(),
    species: "Pikachu",
    nickname: "Pikazzy",
    level: 50,
    metLevel: 3,
    causeOfDeath: "Died doing what he loved.",
};

describe("<DeadPokemon />", () => {
    it("renders its content", () => {
        render(
            <TestProvider>
                <DeadPokemon pokemon={poke} />
            </TestProvider>,
        );
        expect(screen.getByTestId("dead-pokemon")).toBeDefined();
    });
});
