import {
    replaceState,
    syncStateFromHistory,
    updateCustomAreas,
    updateExcludedAreas,
} from "actions";
import { customAreas, excludedAreas } from "../areas";

describe("areas reducers", () => {
    it("updates excluded areas", () => {
        const result = excludedAreas(["old route"], updateExcludedAreas(["Route 1"]));

        expect(result).toEqual(["Route 1"]);
    });

    it("updates custom areas", () => {
        const result = customAreas(["old route"], updateCustomAreas(["Dreamyard"]));

        expect(result).toEqual(["Dreamyard"]);
    });

    it("replaces custom areas from State.customAreas snapshots", () => {
        const result = customAreas(
            ["old route"],
            replaceState({ customAreas: ["Pinwheel Forest exterior"] }) as Parameters<
                typeof customAreas
            >[1],
        );

        expect(result).toEqual(["Pinwheel Forest exterior"]);
    });

    it("syncs custom areas from history snapshots", () => {
        const result = customAreas(
            ["old route"],
            syncStateFromHistory({ customAreas: ["Virbank Complex outside"] }) as Parameters<
                typeof customAreas
            >[1],
        );

        expect(result).toEqual(["Virbank Complex outside"]);
    });
});
