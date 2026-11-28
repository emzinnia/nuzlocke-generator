import * as React from "react";
import { BoxedPokemon } from "../BoxedPokemon2";
import { generateEmptyPokemon } from "utils";
import { render, screen } from "utils/testUtils";

const poke = {
    ...generateEmptyPokemon(),
    species: "Pikachu",
    nickname: "Pikazzy",
    level: 50,
    metLevel: 3,
    causeOfDeath: "Died doing what he loved.",
};

describe(`<${BoxedPokemon.name} />`, () => {
    it("renders its content", () => {
        render(<BoxedPokemon pokemon={poke} />);
        expect(screen.getByTestId("boxed-pokemon")).toBeDefined();
    });
});
