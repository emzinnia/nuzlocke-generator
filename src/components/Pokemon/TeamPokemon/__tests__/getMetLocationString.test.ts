import { getMetLocationString } from "../getMetLocationString";
import { Pokemon } from "models";

describe(getMetLocationString.name, () => {
    const poke: Pokemon = {
        species: "Psyduck",
        metLevel: 4,
        met: "Route 101",
        id: "test",
    };

    it("works with the new format", () => {
        // `Met Location: ${met} at lv.${metLevel}`;
        expect(
            getMetLocationString({ poke, oldMetLocationFormat: false }),
        ).toEqual("Met Location: Route 101 at lv.4");
    });

    it("works with the old format", () => {
        // `Met ${determinePreposition()} ${met}, from lv.${metLevel}`;
        expect(
            getMetLocationString({ poke, oldMetLocationFormat: true }),
        ).toEqual("Met on Route 101, from lv.4");
    });

    it("has a special rule for starters", () => {
        const starter = {
            species: "Charmander",
            metLevel: 5,
            met: "Starter",
            id: "test-1",
        };

        expect(
            getMetLocationString({ poke: starter, oldMetLocationFormat: true }),
        ).toEqual("Met as Starter at lv.5");
    });
});
