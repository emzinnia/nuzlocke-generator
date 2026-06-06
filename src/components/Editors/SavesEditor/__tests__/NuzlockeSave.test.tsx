import { describe, expect, it } from "vitest";
import { getFallbackNuzlockeAfterDelete } from "../NuzlockeSave";
import { NuzlockeSaveEntry } from "reducers/nuzlocke";

describe("getFallbackNuzlockeAfterDelete", () => {
    it("selects a remaining save when the deleted save sorts first", () => {
        const saves: NuzlockeSaveEntry[] = [
            { id: "a-deleted", data: "{\"trainer\":{\"name\":\"Deleted\"}}" },
            { id: "b-remaining", data: "{\"trainer\":{\"name\":\"Remaining\"}}" },
        ];

        expect(
            getFallbackNuzlockeAfterDelete(saves, "a-deleted"),
        ).toMatchObject({
            id: "b-remaining",
        });
    });
});
