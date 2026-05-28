import * as React from "react";
import { render, screen } from "utils/testUtils";
import { PokemonTextInput } from "../CurrentPokemonInput";

describe("<PokemonTextInput />", () => {
    it("renders text suggestions when items are provided", () => {
        const { container } = render(
            <PokemonTextInput
                labelName="Nature"
                inputName="nature"
                type="text"
                value="Brave"
                edit={{ nature: "Brave" }}
                setEdit={vi.fn()}
                onChange={vi.fn()}
                items={["Brave", "Custom"]}
                key="nature"
            />,
        );

        expect(screen.getByDisplayValue("Brave").getAttribute("list")).toBe(
            "nature-options",
        );
        expect(
            container.querySelector('datalist option[value="Custom"]'),
        ).toBeDefined();
    });
});
