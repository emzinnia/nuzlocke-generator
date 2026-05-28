import * as React from "react";
import { BaseEditor } from "..";

import { render, screen } from "utils/testUtils";

describe("<BaseEditor />", () => {
    it("renders its contents", () => {
        render(<BaseEditor name="test" />);
        expect(screen.getByTestId("base-editor").className).toContain(
            "test-editor",
        );
        expect(screen.getByTestId("base-editor").textContent).toContain("test");
    });

    it("renders its children", () => {
        render(
            <BaseEditor name="test">
                <div>Hello World!</div>
            </BaseEditor>,
        );
        expect(screen.findByText("Hello World!")).toBeDefined();
    });

    it("can keep a stable class name separate from its display name", () => {
        render(<BaseEditor name="Pokémon" className="pokemon-editor" />);
        const editor = screen.getByTestId("base-editor");
        expect(editor.className).toContain("pokemon-editor");
        expect(editor.textContent).toContain("Pokémon");
    });
});
