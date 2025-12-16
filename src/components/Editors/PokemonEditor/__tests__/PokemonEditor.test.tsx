import * as React from "react";
import { PokemonEditorBase } from "..";
import { styleDefaults } from "utils";
import { render, screen } from "utils/testUtils";
import { vi } from "vitest";

describe("<PokemonEditor />", () => {
    it("renders its contents", () => {
        render(
            <PokemonEditorBase
                style={styleDefaults}
                team={[]}
                boxes={[]}
                game={{ name: "Red", customName: "" }}
                excludedAreas={[]}
                customAreas={[]}
                toggleDialog={vi.fn()}
            />,
        );
        expect(screen.getByTestId("pokemon-editor")).toBeDefined();
    });
});
