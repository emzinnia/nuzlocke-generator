import * as React from "react";
import { render } from "@testing-library/react";
import { PokemonExtraDataStats } from "../PokemonExtraDataStats";
import { Generation } from "utils";

describe("<PokemonExtraDataStats />", () => {
    const renderStat = vi.fn((value, label) => (
        <div data-testid={label}>{value}</div>
    ));

    beforeEach(() => renderStat.mockClear());

    it("renders Gen1 stats map", () => {
        render(
            <PokemonExtraDataStats
                effectiveGeneration={Generation.Gen1}
                extraData={{ currentHp: 10, attack: 20, defense: 30, special: 40, speed: 50 }}
                renderStat={renderStat}
            />,
        );

        expect(renderStat).toHaveBeenCalledWith(40, "SPC");
    });

    it("uses gen3 stats nested under extraData.stats", () => {
        render(
            <PokemonExtraDataStats
                effectiveGeneration={Generation.Gen3}
                extraData={{ stats: { speed: 99 } }}
                renderStat={renderStat}
            />,
        );

        expect(renderStat).toHaveBeenCalledWith(99, "SPE");
    });
});

