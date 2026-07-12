import { describe, expect, it } from "vitest";
import { getNextSaveAfterDelete } from "../NuzlockeSave";
import { State } from "state";

const saves: State["nuzlockes"]["saves"] = [
    { id: "a-deleted", data: "{\"trainer\":{\"name\":\"Deleted\"}}" },
    { id: "b-next", data: "{\"trainer\":{\"name\":\"Next\"}}" },
    { id: "c-later", data: "{\"trainer\":{\"name\":\"Later\"}}" },
];

describe("NuzlockeSave helpers", () => {
    it("chooses a surviving save when deleting the sorted first save", () => {
        expect(getNextSaveAfterDelete(saves, "a-deleted")?.id).toBe("b-next");
    });

    it("does not mutate the original saves order while choosing a replacement", () => {
        const unsortedSaves: State["nuzlockes"]["saves"] = [
            saves[2],
            saves[0],
            saves[1],
        ];

        expect(getNextSaveAfterDelete(unsortedSaves, "a-deleted")?.id).toBe(
            "b-next",
        );
        expect(unsortedSaves.map((save) => save.id)).toEqual([
            "c-later",
            "a-deleted",
            "b-next",
        ]);
    });
});
