import * as React from "react";
import { AppBase as App } from "..";
import { styleDefaults, generateEmptyPokemon } from "utils";
import { render, screen } from "utils/testUtils";
import { Pokemon } from "models";

describe.skip("<App />", () => {
    it("renders", () => {
        render(
            <App
                view={{ dialogs: { imageUploader: false } }}
                style={styleDefaults}
                pokemon={[generateEmptyPokemon()]}
                addPokemon={(pokemon: Pokemon) => ({ type: "ADD_POKEMON" as const, pokemon })}
                addBox={() => ({ type: "ADD_BOX" as const, box: { id: "1", Pokemon: [], name: "Box" } })}
            />,
        );
        expect(screen.getByTestId("app")).toBeDefined();
    });
});
