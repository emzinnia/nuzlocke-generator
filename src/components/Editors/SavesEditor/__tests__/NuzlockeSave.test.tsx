import { describe, expect, it } from "vitest";
import { State } from "state";
import { getReplacementSaveAfterDelete } from "../NuzlockeSave";

const saves: State["nuzlockes"]["saves"] = [
    {
        id: "a-current",
        data: "{\"trainer\":{\"name\":\"Deleted\"}}",
    },
    {
        id: "b-next",
        data: "{\"trainer\":{\"name\":\"Replacement\"}}",
    },
];

describe("getReplacementSaveAfterDelete", () => {
    it("selects a remaining save instead of the deleted active save", () => {
        expect(getReplacementSaveAfterDelete(saves, "a-current")?.id).toBe(
            "b-next",
        );
    });

    it("returns undefined when no replacement save exists", () => {
        expect(getReplacementSaveAfterDelete([saves[0]], "a-current")).toBe(
            undefined,
        );
    });
});
