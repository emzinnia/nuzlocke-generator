import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { version } from "../../../package.json";
import { editStyle, newNuzlocke } from "actions";
import { PokemonFixtures, TeamFixture } from "utils/fixtures";
import {
    createDefaultState,
    createNuzlockeStore,
} from "store";
import {
    deserializePersistedState,
    PERSIST_KEY,
    serializePersistedState,
} from "../persistence";
import { State } from "state";
import { serializeNuzlockeJson } from "utils/nuzlockeJson";

const createFixtureState = (): State => ({
    ...createDefaultState(),
    game: {
        name: "FireRed",
        customName: "Compatibility Red",
    },
    pokemon: TeamFixture.map((pokemon, index) => ({
        ...pokemon,
        id: `fixture-pokemon-${index}`,
        position: index,
        status: index === 0 ? "Team" : "Boxed",
    })),
    trainer: {
        badges: [],
        name: "Legacy Trainer",
        title: "Downloaded Fixture",
    },
    style: {
        ...createDefaultState().style,
        bgColor: "#123456",
        editorDarkMode: true,
    },
});

describe("Zustand persistence compatibility", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it("serializes Zustand state into the legacy redux-persist localStorage envelope", () => {
        const state = createFixtureState();
        const serialized = serializePersistedState(state);
        const envelope = JSON.parse(serialized);

        expect(envelope.editorHistory).toBeUndefined();
        expect(JSON.parse(envelope.pokemon)).toEqual(state.pokemon);
        expect(JSON.parse(envelope.trainer)).toEqual(state.trainer);
        expect(JSON.parse(envelope.style)).toEqual(state.style);
        expect(JSON.parse(envelope._persist)).toEqual({
            version,
            rehydrated: true,
        });
    });

    it("rehydrates legacy localStorage saves with mixed current-format state", () => {
        const defaultState = createDefaultState();
        const legacyEnvelope = JSON.stringify({
            pokemon: JSON.stringify([
                {
                    ...PokemonFixtures.Pikachu,
                    id: "legacy-pikachu",
                    status: "Team",
                },
            ]),
            trainer: JSON.stringify({
                badges: [],
                name: "Legacy Trainer",
                title: "Imported from localStorage",
            }),
            style: JSON.stringify({
                ...defaultState.style,
                bgColor: "#abcdef",
                editorDarkMode: true,
            }),
            _persist: JSON.stringify({
                version,
                rehydrated: true,
            }),
        });

        window.localStorage.setItem(PERSIST_KEY, legacyEnvelope);

        const { store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });

        expect(store.getState().trainer.name).toBe("Legacy Trainer");
        expect(store.getState().pokemon).toHaveLength(1);
        expect(store.getState().pokemon[0].id).toBe("legacy-pikachu");
        expect(store.getState().style.bgColor).toBe("#abcdef");
        expect(store.getState().style.editorDarkMode).toBe(true);

        unsubscribePersistence();
    });

    it("dispatches through Zustand and flushes the current state back to localStorage", async () => {
        const { persistor, store, unsubscribePersistence, zustandStore } =
            createNuzlockeStore({
                enableLogger: false,
                storage: window.localStorage,
            });

        expect(zustandStore.getState()).toBe(store.getState());

        store.dispatch(editStyle({ bgColor: "#654321" }));
        await persistor.flush();

        const savedState = deserializePersistedState(
            window.localStorage.getItem(PERSIST_KEY),
        );
        expect(savedState?.style?.bgColor).toBe("#654321");
        expect(savedState?.editorHistory).toBeUndefined();

        unsubscribePersistence();
    });

    it("persists saved nuzlocke.json payloads without changing their current export format", async () => {
        const exportedNuzlockeJson = serializeNuzlockeJson(createFixtureState());
        const { persistor, store, unsubscribePersistence } = createNuzlockeStore({
            enableLogger: false,
            storage: window.localStorage,
        });

        store.dispatch(newNuzlocke(exportedNuzlockeJson, { isCopy: false }));
        await persistor.flush();

        const savedState = deserializePersistedState(
            window.localStorage.getItem(PERSIST_KEY),
        );
        expect(savedState?.nuzlockes?.saves).toHaveLength(1);
        expect(savedState?.nuzlockes?.saves[0].data).toBe(exportedNuzlockeJson);
        expect(JSON.parse(savedState?.nuzlockes?.saves[0].data ?? "")).toEqual(
            JSON.parse(exportedNuzlockeJson),
        );

        unsubscribePersistence();
    });
});
