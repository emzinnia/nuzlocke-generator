import * as React from "react";
import { render, screen } from "utils/testUtils";
import { Pokemon } from "models";
import { Types } from "utils";
import { styleDefaults } from "utils/styleDefaults";
import { StatsBase } from "../Stats";

const pokemon = (overrides: Partial<Pokemon>): Pokemon => ({
    id: "pokemon-id",
    species: "Bulbasaur",
    types: [Types.Grass, Types.Poison],
    egg: false,
    ...overrides,
});

describe("StatsBase", () => {
    it("averages only visible pokemon with valid levels", () => {
        render(
            <StatsBase
                pokemon={[
                    pokemon({
                        id: "boxed-47",
                        status: "Boxed",
                        level: "47" as unknown as number,
                    }),
                    pokemon({ id: "blank", status: "Boxed" }),
                    pokemon({
                        id: "invalid",
                        status: "Boxed",
                        level: "not a level" as unknown as number,
                    }),
                    pokemon({ id: "dead-53", status: "Dead", level: 53 }),
                    pokemon({
                        id: "hidden-100",
                        status: "Dead",
                        level: 100,
                        hidden: true,
                    }),
                ]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        averageLevel: true,
                    },
                }}
                box={[]}
            />,
        );

        expect(screen.getByText("Average Level: 50")).toBeTruthy();
    });

    it("averages custom status buckets using only valid levels", () => {
        render(
            <StatsBase
                pokemon={[
                    pokemon({
                        id: "champion-60",
                        status: "Champions",
                        level: "60" as unknown as number,
                    }),
                    pokemon({ id: "champion-empty", status: "Champions" }),
                    pokemon({ id: "champion-62", status: "Champions", level: 62 }),
                    pokemon({ id: "mvp-100", status: "MVP", level: 100 }),
                    pokemon({
                        id: "mvp-hidden",
                        status: "MVP",
                        level: 2,
                        hidden: true,
                    }),
                ]}
                style={{
                    ...styleDefaults,
                    statsOptions: {
                        ...styleDefaults.statsOptions,
                        averageLevelDetailed: true,
                    },
                }}
                box={[
                    { id: 6, name: "Champions", position: 4 },
                    { id: 8, name: "MVP", position: 6 },
                ]}
            />,
        );

        expect(screen.getByText(/Champions \(61\)/)).toBeTruthy();
        expect(screen.getByText(/MVP \(100\)/)).toBeTruthy();
    });
});
