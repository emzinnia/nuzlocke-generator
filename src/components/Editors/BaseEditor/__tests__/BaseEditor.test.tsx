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
});
