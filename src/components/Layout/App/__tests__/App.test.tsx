import * as React from "react";
import { AppBase as App } from "..";
import { styleDefaults, generateEmptyPokemon, noop } from "utils";
import { render, screen } from "utils/testUtils";

describe.skip("<App />", () => {
    it("renders", () => {
        render(
            <App
                view={{ dialogs: { imageUploader: false } }}
                style={styleDefaults}
                pokemon={[generateEmptyPokemon()]}
                addPokemon={noop}
            />,
        );
        expect(screen.getByTestId("app")).toBeDefined();
    });
});
