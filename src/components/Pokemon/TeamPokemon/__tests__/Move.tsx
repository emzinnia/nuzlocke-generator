import * as React from "react";

import { Move } from "../Moves";
import { render } from "@testing-library/react";
import { Types, styleDefaults, typeToColor } from "utils";

describe(Move.name, () => {
    it("renders its contents", () => {
        const move = "Bug Bite";
        const { container } = render(
            <Move
                index={0}
                type={Types.Bug}
                move={move}
                customTypes={[]}
                style={styleDefaults}
                stripClasses={false}
            />,
        );

        const { outerHTML } = container;
        expect(outerHTML).toContain(move);
        expect(outerHTML).toContain("move-bug-bite");
        expect(outerHTML).toContain("move-bug");
        expect(outerHTML).toContain("move-type-bug");
    });

    it("adds explicit type classes for custom multi-word types", () => {
        const { container } = render(
            <Move
                index={0}
                type={"Shadow Fire"}
                move="Dark Pulse"
                customTypes={[
                    {
                        id: "shadow-fire",
                        type: "Shadow Fire",
                        color: "#222222",
                    },
                ]}
                style={styleDefaults}
                stripClasses={false}
            />,
        );

        const move = container.querySelector(".move");
        expect(move?.className).toContain("move-type-shadow-fire");
    });
});
