import { replaceState, syncStateFromHistory } from "actions";
import { appReducers } from "../index";
import { pokemon } from "../pokemon";
import { box } from "../box";
import { history } from "../history";
import { game } from "../game";
import { trainer } from "../trainer";
import { generateEmptyPokemon } from "utils";
import { HistoryEntry, Trainer } from "models";
import { State } from "state";

describe("partial REPLACE_STATE / SYNC_STATE_FROM_HISTORY", () => {
    const existingPokemon = [
        { ...generateEmptyPokemon(), id: "keep-me", species: "Bulbasaur" },
    ];
    const existingBoxes = [
        { id: 0, position: 0, name: "Team" },
        { id: 1, position: 1, name: "Boxed" },
    ];
    const existingHistory: HistoryEntry[] = [
        {
            id: "h1",
            timestamp: new Date(0),
            type: "Meta",
            original: null,
            new: "kept",
        },
    ];
    const existingGame = { name: "Emerald" as const, customName: "My Run" };
    const existingTrainer = {
        name: "Ash",
        badges: [{ name: "Stone", image: "stone" }],
    } as Trainer;

    it("pokemon keeps prior state when replace payload omits pokemon", () => {
        expect(
            pokemon(existingPokemon, replaceState({ game: existingGame })),
        ).toEqual(existingPokemon);
    });

    it("box keeps prior state when replace payload omits box", () => {
        expect(box(existingBoxes, replaceState({ game: existingGame }))).toEqual(
            existingBoxes,
        );
    });

    it("history keeps prior state when replace payload omits history", () => {
        expect(
            history(existingHistory, replaceState({ game: existingGame })),
        ).toEqual(existingHistory);
    });

    it("game keeps prior state when replace payload omits game", () => {
        expect(
            game(existingGame, replaceState({ trainer: existingTrainer })),
        ).toEqual(existingGame);
    });

    it("trainer keeps prior state when replace payload omits trainer", () => {
        expect(
            trainer(
                existingTrainer as Parameters<typeof trainer>[0],
                replaceState({ game: existingGame }),
            ),
        ).toEqual(existingTrainer);
    });

    it("array slices accept empty arrays on replace", () => {
        expect(pokemon(existingPokemon, replaceState({ pokemon: [] }))).toEqual(
            [],
        );
        expect(box(existingBoxes, replaceState({ box: [] }))).toEqual([]);
        expect(
            history(
                existingHistory,
                {
                    type: "REPLACE_STATE",
                    replaceWith: { history: [] },
                } as never,
            ),
        ).toEqual([]);
    });

    it("sync from history keeps prior slices when omitted", () => {
        expect(
            pokemon(existingPokemon, syncStateFromHistory({ game: existingGame })),
        ).toEqual(existingPokemon);
        expect(
            box(existingBoxes, syncStateFromHistory({ game: existingGame })),
        ).toEqual(existingBoxes);
        expect(
            history(
                existingHistory,
                syncStateFromHistory({ game: existingGame }),
            ),
        ).toEqual(existingHistory);
        expect(
            game(existingGame, syncStateFromHistory({ trainer: existingTrainer })),
        ).toEqual(existingGame);
        expect(
            trainer(
                existingTrainer as Parameters<typeof trainer>[0],
                syncStateFromHistory({ game: existingGame }),
            ),
        ).toEqual(existingTrainer);
    });

    it("combineReducers does not throw on partial override-style replace", () => {
        const previous = appReducers(undefined, { type: "@@INIT" } as never);
        const withData = {
            ...previous,
            pokemon: existingPokemon,
            box: existingBoxes,
            history: existingHistory,
            game: existingGame,
            trainer: existingTrainer,
        } as State & { history: HistoryEntry[] };

        expect(() =>
            appReducers(
                withData,
                replaceState({
                    game: { name: "FireRed", customName: "" },
                }),
            ),
        ).not.toThrow();

        const next = appReducers(
            withData,
            replaceState({
                game: { name: "FireRed", customName: "" },
            }),
        ) as State & { history: HistoryEntry[] };

        expect(next.game).toEqual({ name: "FireRed", customName: "" });
        expect(next.pokemon).toEqual(existingPokemon);
        expect(next.box).toEqual(existingBoxes);
        expect(next.history).toEqual(existingHistory);
        expect(next.trainer).toEqual(existingTrainer);
        expect(next.rules).toEqual(withData.rules);
    });
});
