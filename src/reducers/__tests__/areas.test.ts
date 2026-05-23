import { replaceState, syncStateFromHistory, updateCustomAreas } from "actions";
import { customAreas } from "../areas";

describe("customAreas", () => {
    it("updates custom areas directly", () => {
        expect(customAreas([], updateCustomAreas(["Route 101"]))).toEqual([
            "Route 101",
        ]);
    });

    it("restores custom areas when importing state", () => {
        expect(
            customAreas(["Old Area"], replaceState({ customAreas: ["Safari Zone"] })),
        ).toEqual(["Safari Zone"]);
    });

    it("restores custom areas during history sync", () => {
        expect(
            customAreas(
                ["Old Area"],
                syncStateFromHistory({ customAreas: ["Victory Road"] }),
            ),
        ).toEqual(["Victory Road"]);
    });
});
