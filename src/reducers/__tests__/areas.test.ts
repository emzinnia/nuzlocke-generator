import { replaceState, syncStateFromHistory, updateCustomAreas } from "actions";
import { customAreas } from "../areas";

describe("customAreas reducer", () => {
    it("updates custom areas directly", () => {
        expect(customAreas(["Old Area"], updateCustomAreas(["New Area"]))).toEqual([
            "New Area",
        ]);
    });

    it("preserves custom areas when replacing state", () => {
        const result = customAreas(
            ["Old Area"],
            replaceState({ customAreas: ["Imported Route"] }) as unknown as Parameters<
                typeof customAreas
            >[1],
        );

        expect(result).toEqual(["Imported Route"]);
    });

    it("preserves custom areas when syncing from history", () => {
        const result = customAreas(
            ["Old Area"],
            syncStateFromHistory({
                customAreas: ["History Route"],
            }) as unknown as Parameters<typeof customAreas>[1],
        );

        expect(result).toEqual(["History Route"]);
    });
});
