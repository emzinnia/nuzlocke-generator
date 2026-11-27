import * as React from "react";
import { render, screen } from "utils/testUtils";
import { StatsBase } from "../Stats";
import { styleDefaults, Types } from "utils";

describe("<Stats />", () => {
    it("does not count missing secondary types as undefined", () => {
        render(
            <StatsBase
                pokemon={[
                    {
                        id: "rattata",
                        species: "Rattata",
                        status: "Team",
                        types: [Types.Normal] as unknown as [Types, Types],
                    },
                    {
                        id: "pidgey",
                        species: "Pidgey",
                        status: "Team",
                        types: [Types.Normal, Types.Flying],
                    },
                ]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        mostCommonTypes: true,
                    },
                }}
                box={[]}
                stats={[]}
            />,
        );

        const mostCommonTypes = screen.getByText(/Most Common Types:/);

        expect(mostCommonTypes.textContent).toContain(
            "Normal (2 Pokémon), Flying (1 Pokémon)",
        );
        expect(mostCommonTypes.textContent).not.toContain("undefined");
    });
});
