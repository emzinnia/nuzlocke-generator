import { describe, expect, it } from "vitest";
import { replaceState } from "actions";
import { appReducers } from "reducers";
import { State } from "state";
import { createDefaultState } from "store";
import { TeamFixture } from "utils/fixtures";
import {
    serializeNuzlockeJson,
    stripEditorDarkModeForExport,
} from "../nuzlockeJson";

const createDownloadedJsonFixture = (): State => ({
    ...createDefaultState(),
    game: {
        name: "Emerald",
        customName: "Downloaded Compatibility Run",
    },
    pokemon: TeamFixture.map((pokemon, index) => ({
        ...pokemon,
        id: `downloaded-pokemon-${index}`,
        position: index,
        status: index === 0 ? "Team" : "Boxed",
    })),
    trainer: {
        badges: [],
        name: "Downloaded Trainer",
        title: "Current Format Fixture",
    },
    style: {
        ...createDefaultState().style,
        bgColor: "#0f766e",
        editorDarkMode: true,
    },
});

describe("nuzlocke.json export compatibility", () => {
    it("keeps downloaded nuzlocke.json in the current state shape without volatile fields", () => {
        const state = createDownloadedJsonFixture();
        const exported = stripEditorDarkModeForExport(state) as Partial<State>;

        expect(exported.editorHistory).toBeUndefined();
        expect(exported.pokemon).toEqual(state.pokemon);
        expect(exported.trainer).toEqual(state.trainer);
        expect(exported.style).toMatchObject({
            bgColor: "#0f766e",
        });
        expect(exported.style).not.toHaveProperty("editorDarkMode");
        expect(JSON.parse(serializeNuzlockeJson(state))).toEqual(exported);
    });

    it("imports the downloaded nuzlocke.json payload through the existing state reducers", () => {
        const state = createDownloadedJsonFixture();
        const imported = JSON.parse(serializeNuzlockeJson(state));
        const defaultState = createDefaultState();
        const nextState = appReducers(
            defaultState as unknown as Parameters<typeof appReducers>[0],
            replaceState(imported),
        ) as unknown as State;

        expect(nextState.pokemon).toEqual(state.pokemon);
        expect(nextState.trainer).toEqual(state.trainer);
        expect(nextState.game).toEqual(state.game);
        expect(nextState.style.bgColor).toBe("#0f766e");
        expect(nextState.style.editorDarkMode).toBe(
            defaultState.style.editorDarkMode,
        );
    });
});
