import { rules } from "../rules";
import {
    addRule,
    deleteRule,
    editRule,
    resetRules,
    setRules,
    replaceState,
    syncStateFromHistory,
} from "actions";

const initialRules = [
    "Each Pokémon that faints is considered dead and must be released or permaboxed",
    "You can only catch the first Pokemon you encounter in an area",
    "All Pokémon must be nicknamed",
];

describe("rules reducer", () => {
    it("returns state by default", () => {
        const starting = ["rule a", "rule b"];
        const result = rules(
            starting,
            { type: "UNKNOWN" } as unknown as Parameters<typeof rules>[1],
        );
        expect(result).toEqual(starting);
    });

    it("adds an empty rule", () => {
        const result = rules(["rule a"], addRule());
        expect(result).toEqual(["rule a", ""]);
    });

    it("edits a rule by index", () => {
        const result = rules(["rule a", "rule b"], editRule(1, "updated"));
        expect(result).toEqual(["rule a", "updated"]);
    });

    it("deletes a rule by 0-based index", () => {
        expect(rules(["first", "second", "third"], deleteRule(0))).toEqual([
            "second",
            "third",
        ]);
        expect(rules(["first", "second", "third"], deleteRule(1))).toEqual([
            "first",
            "third",
        ]);
        expect(rules(["first", "second", "third"], deleteRule(2))).toEqual([
            "first",
            "second",
        ]);
    });

    it("resets to the default ruleset", () => {
        const result = rules(["custom"], resetRules());
        expect(result).toEqual(initialRules);
    });

    it("sets rules to a provided list", () => {
        const newRules = ["only rule"];
        const result = rules(["old"], setRules(newRules));
        expect(result).toEqual(newRules);
        expect(result).not.toBe(newRules); // defensive copy
    });

    it("replaces rules when replacing state", () => {
        const replacement = ["replace me"];
        const result = rules(
            ["old"],
            replaceState({ rules: replacement }) as unknown as Parameters<
                typeof rules
            >[1],
        );
        expect(result).toEqual(replacement);
    });

    it("falls back to default rules when replace payload omits rules", () => {
        const result = rules(
            ["custom"],
            replaceState({}) as unknown as Parameters<typeof rules>[1],
        );
        expect(result).toEqual(initialRules);
    });

    it("syncs rules when syncing from history", () => {
        const synced = ["history rule"];
        const result = rules(
            ["old"],
            syncStateFromHistory({ rules: synced }) as unknown as Parameters<
                typeof rules
            >[1],
        );
        expect(result).toEqual(synced);
    });

    it("falls back to default rules when history sync omits rules", () => {
        const result = rules(
            ["custom"],
            syncStateFromHistory({}) as unknown as Parameters<typeof rules>[1],
        );
        expect(result).toEqual(initialRules);
    });
});
