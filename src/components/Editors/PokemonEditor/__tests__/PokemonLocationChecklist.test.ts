import { sortEncounterAreas } from "../PokemonLocationChecklist";

describe("sortEncounterAreas", () => {
    const areas = ["Route 10", "Route 2", "Gale Forest"];

    it("preserves map order by default", () => {
        expect(sortEncounterAreas(areas, "map-order")).toEqual(areas);
    });

    it("sorts areas alphabetically with numeric route ordering", () => {
        expect(sortEncounterAreas(areas, "alphabetical")).toEqual([
            "Gale Forest",
            "Route 2",
            "Route 10",
        ]);
    });
});

