import * as React from "react";
import { render } from "@testing-library/react";
import { Move, MovesBase } from "../Moves";
import { Generation, styleDefaults } from "utils";

describe("<Move />", () => {
    it("renders move with type-derived class names", () => {
        const { container } = render(
            <Move
                index={0}
                style={styleDefaults}
                type="Fire"
                move="Flamethrower"
                customTypes={[]}
            />,
        );

        expect(container.querySelector(".move-flamethrower")).toBeTruthy();
    });
});

describe("<MovesBase />", () => {
    const baseProps = {
        generation: Generation.Gen3,
        moves: ["Tackle", "Thunderbolt"],
        movesPosition: "horizontal",
        style: styleDefaults,
        customMoveMap: [],
        customTypes: [],
    };

    it("renders moves list with classes", () => {
        const { container } = render(<MovesBase {...baseProps} />);

        expect(container.querySelectorAll(".move").length).toBe(2);
    });

    it("renders bare nodes when stripClasses is true", () => {
        const { container } = render(
            <MovesBase {...baseProps} stripClasses movesPosition="horizontal" />,
        );

        expect(container.querySelector(".pokemon-moves")).toBeNull();
    });
});

