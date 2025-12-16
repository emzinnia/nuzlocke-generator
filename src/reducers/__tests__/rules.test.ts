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
        const result = rules(starting, { type: "UNKNOWN" } as any);
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

    it("deletes using the existing 1-based index behavior", () => {
        const result = rules(["first", "second", "third"], deleteRule(2));
        // current reducer deletes where index + 1 matches target
        expect(result).toEqual(["first", "third"]);
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
        const result = rules(["old"], replaceState({ rules: replacement }) as any);
        expect(result).toEqual(replacement);
    });

    it("syncs rules when syncing from history", () => {
        const synced = ["history rule"];
        const result = rules(["old"], syncStateFromHistory({ rules: synced }) as any);
        expect(result).toEqual(synced);
    });
});

