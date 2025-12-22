/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
    ResultInner,
    TeamPokemonMemberView,
    TopBarWithDownload,
} from "../Result2";
import { appReducers } from "reducers";
import { State } from "state";
import { styleDefaults, generateEmptyPokemon } from "utils";
import { Box, Pokemon } from "models";

const toPngMock = vi.fn().mockResolvedValue("data:image/png;base64");

vi.mock("@emmaramirez/dom-to-image", () => ({
    domToImage: {
        toPng: (...args: any[]) => toPngMock(...args),
    },
}));

vi.mock("components/Layout/TopBar/TopBar", () => ({
    TopBar: ({ onClickDownload, children, isDownloading }: any) => (
        <div data-testid="top-bar">
            <button onClick={onClickDownload}>download</button>
            <span data-testid="top-bar-status">
                {isDownloading ? "downloading" : "idle"}
            </span>
            {children}
        </div>
    ),
}));

vi.mock("components/Pokemon/TeamPokemon/TeamPokemon2", () => ({
    TeamPokemon: ({ pokemon }: any) => (
        <div data-testid={`team-${pokemon.species}`}>{pokemon.species}</div>
    ),
}));

vi.mock("components/Pokemon/BoxedPokemon/BoxedPokemon2", () => ({
    BoxedPokemon: ({ pokemon }: any) => (
        <div data-testid={`boxed-${pokemon.species}`}>{pokemon.species}</div>
    ),
}));

vi.mock("components/Pokemon/DeadPokemon/DeadPokemon2", () => ({
    DeadPokemon: ({ pokemon }: any) => (
        <div data-testid={`dead-${pokemon.species}`}>{pokemon.species}</div>
    ),
}));

vi.mock("components/Pokemon/ChampsPokemon/ChampsPokemonCollection", () => ({
    ChampsPokemonView: ({ pokemon }: any) => (
        <div data-testid="champs">{pokemon?.map((p: Pokemon) => p.species).join(",")}</div>
    ),
}));

vi.mock("components/Layout/Layout/Layout", () => ({
    Layout: ({ children, name }: any) => (
        <div data-testid={name ?? "layout"}>{children}</div>
    ),
    LayoutDisplay: { Flex: "flex", Inline: "inline" },
    LayoutDirection: { Row: "row", Column: "column" },
    LayoutAlignment: { Center: "center" },
    LayoutSpacing: { Center: "center" },
    LayoutWrap: { Wrap: "wrap", NoWrap: "nowrap" },
}));

vi.mock("components/Common/Shared", () => ({
    ErrorBoundary: ({ children }: any) => <>{children}</>,
}));

vi.mock("components/Features/Result/TrainerResult", () => ({
    TrainerResult: () => <div data-testid="trainer-result" />,
}));

const boxes: Box[] = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

const createStoreWithState = (overrides: Partial<State> = {}) => {
    const base = appReducers(undefined, { type: "@@INIT" } as any) as State;
    return createStore(appReducers, {
        ...base,
        ...overrides,
        style: { ...base.style, ...(overrides.style ?? {}) },
        trainer: { ...base.trainer, ...(overrides.trainer ?? {}) },
        pokemon: overrides.pokemon ?? base.pokemon,
        box: overrides.box ?? base.box,
    } as State);
};

describe("<TeamPokemonMemberView />", () => {
    it("toggles context menu on click", () => {
        render(
            <TeamPokemonMemberView
                pokemon={{ id: "p1", species: "Alpha" } as Pokemon}
            />,
        );

        expect(screen.queryByText("Delete")).toBeNull();
        fireEvent.click(screen.getByRole("group"));
        expect(screen.getByText("Delete")).toBeTruthy();
    });
});

describe("<ResultInner />", () => {
    it("renders pokemon groups and trainer info from the store", () => {
        const pokemon: Pokemon[] = [
            generateEmptyPokemon([], { id: "t1", species: "Alpha", status: "Team" }),
            generateEmptyPokemon([], {
                id: "b1",
                species: "Boxmon",
                status: "Boxed",
                hidden: false,
            }),
            generateEmptyPokemon([], { id: "d1", species: "Fallen", status: "Dead" }),
            generateEmptyPokemon([], { id: "c1", species: "Champion", status: "Champs" }),
        ];

        const store = createStoreWithState({
            pokemon,
            box: boxes,
            style: {
                ...styleDefaults,
                resultHeight: 400,
                resultWidth: 500,
                trainerAuto: true,
            },
            trainer: { notes: "Do not lose." } as any,
        });

        render(
            <Provider store={store}>
                <ResultInner ref={React.createRef<HTMLDivElement>()} />
            </Provider>,
        );

        expect(screen.getByTestId("result")).toBeTruthy();
        expect(screen.getByTestId("team-Alpha")).toBeTruthy();
        expect(screen.getByTestId("boxed-Boxmon")).toBeTruthy();
        expect(screen.getByTestId("dead-Fallen")).toBeTruthy();
        expect(screen.getByTestId("champs").textContent).toContain("Champion");
        expect(screen.getByText("Do not lose.")).toBeTruthy();
    });
});

describe("<TopBarWithDownload />", () => {
    it("invokes dom-to-image when download is clicked", async () => {
        const ref = React.createRef<HTMLDivElement>();
        ref.current = document.createElement("div");

        render(<TopBarWithDownload ref={ref} />);

        fireEvent.click(screen.getByText("download"));

        expect(screen.getByTestId("top-bar-status").textContent).toBe(
            "downloading",
        );
        await waitFor(() => expect(toPngMock).toHaveBeenCalled());
    });
});

