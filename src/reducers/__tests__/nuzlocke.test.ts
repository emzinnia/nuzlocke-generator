import {
    newNuzlocke,
    updateNuzlocke,
    updateSwitchNuzlocke,
} from "actions";
import { nuzlockes, Nuzlockes } from "../nuzlocke";

describe("nuzlockes", () => {
    const savedRuns: Nuzlockes = {
        currentId: "run-a",
        saves: [
            { id: "run-a", data: "red" },
            { id: "run-b", data: "blue", isCopy: true },
            { id: "run-c", data: "yellow" },
        ],
    };

    it("appends new nuzlockes in creation order", () => {
        const first = nuzlockes(undefined, newNuzlocke("red", { isCopy: false }));
        const second = nuzlockes(first, newNuzlocke("blue", { isCopy: false }));

        expect(second.saves.map((save) => save.data)).toEqual(["red", "blue"]);
    });

    it("updates a saved nuzlocke without changing list order", () => {
        const result = nuzlockes(savedRuns, updateNuzlocke("run-b", "silver"));

        expect(result.saves.map((save) => save.id)).toEqual([
            "run-a",
            "run-b",
            "run-c",
        ]);
        expect(result.saves[1]).toEqual({
            id: "run-b",
            data: "silver",
            isCopy: true,
        });
    });

    it("keeps save order when switching away from the current nuzlocke", () => {
        const result = nuzlockes(
            savedRuns,
            updateSwitchNuzlocke("run-a", "run-c", "crystal"),
        );

        expect(result.currentId).toBe("run-c");
        expect(result.saves.map((save) => save.id)).toEqual([
            "run-a",
            "run-b",
            "run-c",
        ]);
        expect(result.saves[0].data).toBe("crystal");
    });
});
