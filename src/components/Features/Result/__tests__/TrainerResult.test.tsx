/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { render, screen } from "@testing-library/react";

import {
    TrainerResultBase,
    TrainerColumnItem,
    CheckpointsDisplay,
    isSWSH,
} from "../TrainerResult";
import { styleDefaults } from "utils";
import { State } from "state";
import { appReducers } from "reducers";

const createStoreWithState = (overrides: Partial<State> = {}) => {
    const base = appReducers(undefined, { type: "@@INIT" } as any) as State;
    return createStore(appReducers, {
        ...base,
        ...overrides,
        style: { ...base.style, ...(overrides.style ?? {}) },
        trainer: { ...base.trainer, ...(overrides.trainer ?? {}) },
        game: { ...base.game, ...(overrides.game ?? {}) },
        rules: overrides.rules ?? base.rules,
        checkpoints: overrides.checkpoints ?? base.checkpoints,
    } as State);
};

describe("Trainer helpers", () => {
    it("renders a column item when value exists", () => {
        render(
            <TrainerColumnItem
                trainer={{ name: "Blue" } as any}
                prop="name"
                orientation="horizontal"
            />,
        );

        expect(screen.getByText("name")).toBeTruthy();
        expect(screen.getByText("Blue")).toBeTruthy();
    });

    it("detects Sword and Shield games", () => {
        expect(isSWSH("Sword")).toBe(true);
        expect(isSWSH("Shield")).toBe(true);
        expect(isSWSH("Red")).toBe(false);
    });
});

describe("<TrainerResultBase />", () => {
    it("shows trainer details and rules inside trainer section", () => {
        const store = createStoreWithState({
            style: {
                ...styleDefaults,
                displayRules: true,
                displayRulesLocation: "inside trainer section",
            },
            trainer: {
                title: "Kanto Run",
                name: "Ash",
                badges: [],
            } as any,
            game: { name: "Red", customName: "Custom Red" } as any,
            rules: ["Rule A", "Rule B"],
        });

        render(
            <Provider store={store}>
                <TrainerResultBase
                    orientation="horizontal"
                    trainer={store.getState().trainer}
                    game={store.getState().game as any}
                    style={store.getState().style}
                    checkpoints={store.getState().checkpoints}
                    rules={store.getState().rules}
                />
            </Provider>,
        );

        expect(screen.getByText("Custom Red")).toBeTruthy();
        expect(screen.getByText("Kanto Run")).toBeTruthy();
        expect(screen.getByText("Rule A")).toBeTruthy();
        expect(screen.getByText("Rule B")).toBeTruthy();
    });
});

describe("<CheckpointsDisplay />", () => {
    it("renders badges and marks obtained ones", () => {
        const checkpoints = [
            { name: "Boulder Badge", image: "boulder" },
            { name: "Cascade Badge", image: "cascade" },
        ];

        const store = createStoreWithState({
            checkpoints,
            style: { ...styleDefaults, displayBadges: true },
            trainer: {
                badges: [{ name: "Boulder Badge", image: "boulder" }],
            } as any,
            game: { name: "Red", customName: "" } as any,
        });

        render(
            <Provider store={store}>
                <CheckpointsDisplay
                    style={store.getState().style}
                    trainer={store.getState().trainer}
                    game={store.getState().game}
                />
            </Provider>,
        );

        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(2);
        expect(images[0].getAttribute("data-badge")).toBe("Boulder Badge");
        expect(images[0].className).toContain("obtained");
        expect(images[1].className).toContain("not-obtained");
    });
});

