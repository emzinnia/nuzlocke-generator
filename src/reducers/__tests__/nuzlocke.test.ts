import { describe, expect, it } from "vitest";
import { deleteNuzlocke } from "actions";
import { nuzlockes, Nuzlockes } from "../nuzlocke";

describe("nuzlockes reducer", () => {
    it("moves currentId to a remaining save when deleting the current save", () => {
        const state: Nuzlockes = {
            currentId: "a-current",
            saves: [
                { id: "a-current", data: "{}" },
                { id: "b-next", data: "{\"game\":{\"name\":\"Gold\"}}" },
            ],
        };

        const result = nuzlockes(state, deleteNuzlocke("a-current"));

        expect(result.currentId).toBe("b-next");
        expect(result.saves.map((save) => save.id)).toEqual(["b-next"]);
    });
});
