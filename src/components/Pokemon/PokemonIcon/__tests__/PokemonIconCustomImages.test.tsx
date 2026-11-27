import * as React from "react";
import { render, screen } from "utils/testUtils";
import {
    getCustomIconImageStyle,
    PokemonIconPlain,
} from "../PokemonIcon";

describe(getCustomIconImageStyle.name, () => {
    it("sets stable square bounds for custom icon images", () => {
        expect(
            getCustomIconImageStyle({
                height: "32px",
                imageRendering: "pixelated",
                maxWidth: "auto",
            }),
        ).toEqual({
            height: "32px",
            imageRendering: "pixelated",
            maxWidth: "32px",
            objectFit: "contain",
            width: "32px",
        });
    });
});

describe(PokemonIconPlain.name, () => {
    it("renders custom icons as contained square images", () => {
        render(
            <PokemonIconPlain
                customIcon="data:image/png;base64,custom"
                imageStyle={{ height: "32px", maxWidth: "auto" }}
                onClick={vi.fn()}
                selectedId={null}
                species="Pikachu"
            />,
        );

        const image = screen.getByAltText("Pikachu");

        expect(image.style.height).toBe("32px");
        expect(image.style.maxWidth).toBe("32px");
        expect(image.style.objectFit).toBe("contain");
        expect(image.style.width).toBe("32px");
    });
});
