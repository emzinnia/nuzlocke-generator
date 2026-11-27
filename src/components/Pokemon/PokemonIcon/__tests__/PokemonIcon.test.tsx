import * as React from "react";
import { render, screen, waitFor } from "utils/testUtils";
import { PokemonIconPlain } from "../PokemonIcon";

const baseProps = {
    id: "pikachu",
    species: "Pikachu",
    onClick: vi.fn(),
    selectedId: null,
};

describe(PokemonIconPlain.name, () => {
    it("does not let the default icon image start a native browser drag", () => {
        render(<PokemonIconPlain {...baseProps} />);

        expect(screen.getByAltText("Pikachu").getAttribute("draggable")).toBe(
            "false",
        );
    });

    it("does not let a custom icon image start a native browser drag", async () => {
        render(
            <PokemonIconPlain
                {...baseProps}
                customIcon="data:image/png;base64,custom"
            />,
        );

        await waitFor(() =>
            expect(
                screen.getByAltText("Pikachu").getAttribute("draggable"),
            ).toBe("false"),
        );
    });
});
