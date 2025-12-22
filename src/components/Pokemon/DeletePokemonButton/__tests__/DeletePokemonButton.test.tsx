/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { DeletePokemonButtonBase } from "../DeletePokemonButton";

const deletePokemon = vi.fn();
const modifyDeletionConfirmation = vi.fn();

const setup = (props?: Partial<React.ComponentProps<typeof DeletePokemonButtonBase>>) =>
    render(
        <DeletePokemonButtonBase
            id="poke-1"
            confirmation
            deletePokemon={deletePokemon as any}
            modifyDeletionConfirmation={modifyDeletionConfirmation as any}
            {...props}
        />,
    );

describe.skip("<DeletePokemonButtonBase />", () => {
    beforeEach(() => {
        deletePokemon.mockClear();
        modifyDeletionConfirmation.mockClear();
    });

    it("opens confirmation dialog and deletes when confirmed", () => {
        const { getByTestId, getAllByText } = setup();

        fireEvent.click(getByTestId("trash-icon"));
        const buttons = getAllByText("Delete Pokemon");
        fireEvent.click(buttons[buttons.length - 1]);

        expect(deletePokemon).toHaveBeenCalledWith("poke-1");
    });

    it("bypasses dialog when confirmation is disabled", () => {
        const { getByTestId } = setup({ confirmation: false });

        fireEvent.click(getByTestId("trash-icon"));

        expect(deletePokemon).toHaveBeenCalledWith("poke-1");
    });

    it("toggles confirmation preference checkbox", () => {
        const { getByTestId, getByLabelText } = setup();

        fireEvent.click(getByTestId("trash-icon"));
        fireEvent.click(getByLabelText("Don't Ask Me For Confirmation Again"));

        expect(modifyDeletionConfirmation).toHaveBeenCalledWith(false);
    });
});

