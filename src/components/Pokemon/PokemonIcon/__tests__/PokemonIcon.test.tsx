import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
    PokemonIconPlain,
    getIconURL,
} from "../PokemonIcon";
import { Gender } from "components/Common/Shared";

vi.mock("components/Common/Shared/PokemonImage", () => ({
    PokemonImage: ({ children }: any) => <>{children("custom-icon.png")}</>,
}));

vi.mock("components/Common/Shared/ResizedImage", () => ({
    ResizedImage: (props: any) => <img data-testid="resized" {...props} />,
}));

describe("getIconURL", () => {
    it("builds shiny female forme url", () => {
        const url = getIconURL({
            id: "1",
            species: "Pikachu",
            forme: "Mega-X" as any,
            shiny: true,
            gender: Gender.Female,
            customIcon: "",
            egg: false,
        });

        expect(url).toContain("icons/pokemon/shiny/pikachu-mega-x.png");
    });

    it("returns egg icon for eggs", () => {
        const url = getIconURL({
            id: "2",
            species: "Egg",
            forme: undefined,
            shiny: false,
            gender: Gender.Genderless,
            customIcon: "",
            egg: true,
        });

        expect(url).toBe("icons/pokemon/egg.png");
    });
});

describe("<PokemonIconPlain />", () => {
    it("renders custom icon via ResizedImage", () => {
        const onClick = vi.fn();
        const { getByTestId } = render(
            <PokemonIconPlain
                id="p1"
                species="Mew"
                forme={undefined}
                gender={Gender.Genderless}
                shiny={false}
                egg={false}
                className="custom"
                customIcon="data:image/png;base64"
                imageStyle={{ height: "32px" }}
                onClick={onClick}
                selectedId={null}
                includeTitle
                style={{}}
            />,
        );

        fireEvent.click(getByTestId("resized"));

        expect(onClick).toHaveBeenCalled();
    });

    it("falls back to sprite icon when no custom icon", () => {
        const { getByAltText } = render(
            <PokemonIconPlain
                id="p2"
                species="Ditto"
                forme={undefined}
                gender={Gender.Genderless}
                shiny={false}
                egg={false}
                className="custom"
                imageStyle={{ height: "32px" }}
                onClick={() => undefined}
                selectedId={null}
                includeTitle
                style={{}}
            />,
        );

        expect(getByAltText("Ditto").getAttribute("src")).toContain("icons/pokemon/");
    });
});

