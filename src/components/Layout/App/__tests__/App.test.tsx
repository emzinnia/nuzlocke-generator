import * as React from "react";
import { AppBase as App } from "..";
import { styleDefaults } from "utils";
import { render, screen } from "utils/testUtils";

describe.skip("<App />", () => {
    it("renders", () => {
        render(
            <App
                view={{ dialogs: { imageUploader: false } }}
                style={styleDefaults}
            />,
        );
        expect(screen.getByTestId("app")).toBeDefined();
    });
});
