import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { AddPokemonButton } from "../AddPokemonButton";
import { generateEmptyPokemon } from "utils";

const dispatch = vi.fn();

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useDispatch: () => dispatch,
    };
});

describe("<AddPokemonButton />", () => {
    it("dispatches add and select actions when clicked", () => {
        const pokemon = generateEmptyPokemon([], { id: "poke-1", species: "Eevee" });

        const { getByTestId } = render(<AddPokemonButton pokemon={pokemon} />);

        fireEvent.click(getByTestId("add-pokemon-button"));

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].pokemon).toEqual(pokemon);
        expect(dispatch.mock.calls[1][0].id).toBe("poke-1");
    });
});

