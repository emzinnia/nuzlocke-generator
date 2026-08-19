import { replaceState, syncStateFromHistory } from "actions";
import { appReducers } from "reducers";
import { createDefaultState } from "store";
import { customAreas, excludedAreas } from "../areas";
import { customMoveMap } from "../customMoveMap";
import { customTypes } from "../customTypes";
import { hotkeys } from "../hotkeys";
import { stats } from "../stats";

describe("REPLACE_STATE auxiliary slice preservation", () => {
    it("keeps prior customAreas when the payload omits them", () => {
        expect(
            customAreas(["Safari Zone"], replaceState({ game: { name: "Emerald", customName: "" } })),
        ).toEqual(["Safari Zone"]);
    });

    it("keeps prior excludedAreas when the payload omits them", () => {
        expect(
            excludedAreas(
                ["Route 1"],
                replaceState({ game: { name: "Emerald", customName: "" } }),
            ),
        ).toEqual(["Route 1"]);
    });

    it("keeps prior customTypes when the payload omits them", () => {
        const prior = [{ id: "1", type: "Cosmic", color: "purple" }];
        expect(
            customTypes(prior, replaceState({ game: { name: "Emerald", customName: "" } })),
        ).toEqual(prior);
    });

    it("keeps prior customMoveMap when the payload omits them", () => {
        const prior = [{ id: "m1", type: "Fire", move: "Ember" }];
        expect(
            customMoveMap(prior, replaceState({ game: { name: "Emerald", customName: "" } })),
        ).toEqual(prior);
    });

    it("keeps prior stats when the payload omits them", () => {
        const prior = [{ id: "s1", key: "Deaths", value: "3" }];
        expect(
            stats(prior, replaceState({ game: { name: "Emerald", customName: "" } })),
        ).toEqual(prior);
    });

    it("keeps prior hotkeys when the payload omits them", () => {
        const prior = { "nuzlocke.save": "n" };
        expect(
            hotkeys(prior, replaceState({ game: { name: "Emerald", customName: "" } })),
        ).toEqual(prior);
    });

    it("still replaces auxiliary slices when they are provided", () => {
        expect(
            customAreas(["Old"], replaceState({ customAreas: ["New Route"] })),
        ).toEqual(["New Route"]);
        expect(customAreas(["Old"], replaceState({ customAreas: [] }))).toEqual(
            [],
        );
        expect(
            hotkeys(
                { "nuzlocke.save": "n" },
                replaceState({ hotkeys: { "nuzlocke.save": "s" } }),
            ),
        ).toEqual({ "nuzlocke.save": "s" });
    });

    it("keeps prior auxiliary slices during history sync when omitted", () => {
        expect(
            customAreas(
                ["Kept Area"],
                syncStateFromHistory({ game: { name: "Emerald", customName: "" } }),
            ),
        ).toEqual(["Kept Area"]);
        expect(
            hotkeys(
                { "nuzlocke.save": "n" },
                syncStateFromHistory({ game: { name: "Emerald", customName: "" } }),
            ),
        ).toEqual({ "nuzlocke.save": "n" });
    });

    it("preserves auxiliary slices through combineReducers on partial override imports", () => {
        const base = createDefaultState();
        const current = {
            ...base,
            customAreas: ["Custom Route"],
            excludedAreas: ["Excluded"],
            customTypes: [{ id: "1", type: "Cosmic", color: "purple" }],
            customMoveMap: [{ id: "m1", type: "Fire", move: "Ember" }],
            stats: [{ id: "s1", key: "Deaths", value: "2" }],
            hotkeys: { "nuzlocke.save": "n" },
        };

        // Include core slices that still crash when omitted on master (#1374),
        // while omitting auxiliaries to assert they are no longer wiped.
        const next = appReducers(
            current as unknown as Parameters<typeof appReducers>[0],
            replaceState({
                pokemon: current.pokemon,
                box: current.box,
                game: { name: "Emerald", customName: "" },
                trainer: current.trainer,
                rules: current.rules,
                // history lives in the store but is omitted from the State type
                history: (current as { history?: unknown }).history ?? [],
            } as Parameters<typeof replaceState>[0]),
        );

        expect(next.customAreas).toEqual(["Custom Route"]);
        expect(next.excludedAreas).toEqual(["Excluded"]);
        expect(next.customTypes).toEqual([
            { id: "1", type: "Cosmic", color: "purple" },
        ]);
        expect(next.customMoveMap).toEqual([
            { id: "m1", type: "Fire", move: "Ember" },
        ]);
        expect(next.stats).toEqual([{ id: "s1", key: "Deaths", value: "2" }]);
        expect(next.hotkeys).toEqual({ "nuzlocke.save": "n" });
        expect(next.game).toEqual({ name: "Emerald", customName: "" });
    });
});
