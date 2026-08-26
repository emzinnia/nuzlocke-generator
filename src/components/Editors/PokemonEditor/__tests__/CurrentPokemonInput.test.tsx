import * as React from "react";
import { render } from "utils/testUtils";
import { PokemonMoveInput } from "../CurrentPokemonInput";

describe("<PokemonMoveInput />", () => {
    it("attaches standard and custom move suggestions to the move input", () => {
        const { container } = render(
            <PokemonMoveInput
                labelName="Moves"
                inputName="moves"
                type="moves"
                value={["Tackle"]}
                selectedId="test-pokemon"
                customTypes={[]}
                customMoveMap={[
                    { id: "custom-1", move: "Volt Crash", type: "Electric" },
                ]}
                setEdit={() => undefined}
                edit={{ moves: ["Tackle"] }}
                onChange={() => undefined}
                key="moves"
            />,
        );

        const input = container.querySelector("input");
        const dataList = container.querySelector("datalist");
        const options = Array.from(
            container.querySelectorAll("datalist option"),
        ).map((option) => option.getAttribute("value"));

        expect(input?.getAttribute("list")).toBe("move-suggestions-test-pokemon");
        expect(dataList?.id).toBe("move-suggestions-test-pokemon");
        expect(options).toContain("Tackle");
        expect(options).toContain("Volt Crash");
    });
});
