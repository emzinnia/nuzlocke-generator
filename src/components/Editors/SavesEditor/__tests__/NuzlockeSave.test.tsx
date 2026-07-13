import { describe, expect, it } from "vitest";
import {
    getReplacementNuzlockeSave,
    getSortedNuzlockeSaves,
} from "../NuzlockeSave";

describe("NuzlockeSave helpers", () => {
    const saves = [
        { id: "b-save", data: "{\"game\":{\"name\":\"Blue\"}}" },
        { id: "a-save", data: "{\"game\":{\"name\":\"Red\"}}" },
    ];

    it("sorts saves without mutating state", () => {
        expect(getSortedNuzlockeSaves(saves).map((save) => save.id)).toEqual([
            "a-save",
            "b-save",
        ]);
        expect(saves.map((save) => save.id)).toEqual(["b-save", "a-save"]);
    });

    it("selects a remaining save when the current first save is deleted", () => {
        expect(getReplacementNuzlockeSave(saves, "a-save")?.id).toBe(
            "b-save",
        );
    });
});
