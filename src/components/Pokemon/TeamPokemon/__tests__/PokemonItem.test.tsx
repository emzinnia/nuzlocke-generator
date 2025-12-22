/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { render } from "@testing-library/react";
import { PokemonItem } from "../PokemonItem";
import { styleDefaults } from "utils";

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({ children }: any) => <>{children("custom-item.png")}</>,
}));

vi.mock("components/Common/Shared/ResizedImage", () => ({
    ResizedImage: (props: any) => <img data-testid="resized-item" {...props} />,
}));

const pokemon = {
    id: "p1",
    species: "Snorlax",
    types: ["Normal", "Normal"],
    item: "Leftovers",
    customItemImage: "",
} as any;

describe("<PokemonItem />", () => {
    it("renders held item image", () => {
        const { getByAltText } = render(
            <PokemonItem
                pokemon={pokemon}
                style={{ ...styleDefaults, itemStyle: "round" }}
                customTypes={[]}
            />,
        );

        expect(getByAltText("Leftovers")).toBeTruthy();
    });

    it("renders custom item image when provided", () => {
        const { getByTestId } = render(
            <PokemonItem
                pokemon={{ ...pokemon, customItemImage: "data:image/png" }}
                style={{ ...styleDefaults, itemStyle: "outer glow" }}
                customTypes={[]}
            />,
        );

        expect(getByTestId("resized-item").getAttribute("src")).toBe(
            "custom-item.png",
        );
    });

    it("hides when displayItemAsText is true", () => {
        const { container } = render(
            <PokemonItem
                pokemon={pokemon}
                style={{ ...styleDefaults, displayItemAsText: true }}
                customTypes={[]}
            />,
        );

        expect(container.firstChild).toBeNull();
    });
});

