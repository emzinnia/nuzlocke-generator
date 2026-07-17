import { getBadges } from "utils";
import { getCheckpointsForSaveImport } from "../importCheckpoints";

describe("getCheckpointsForSaveImport", () => {
    it("uses the imported game's defaults when checkpoints are unmodified", () => {
        expect(
            getCheckpointsForSaveImport(
                getBadges("Red"),
                "Red",
                "Black 2",
            ),
        ).toEqual(getBadges("Black 2"));
    });

    it("preserves a customized checkpoint list", () => {
        const checkpoints = [
            ...getBadges("Red").slice(1),
            { name: "Elite Four", image: "custom-elite-four" },
        ];

        expect(
            getCheckpointsForSaveImport(checkpoints, "Red", "Black 2"),
        ).toBe(checkpoints);
    });
});
