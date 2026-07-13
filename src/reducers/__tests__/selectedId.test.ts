import {
    deletePokemon,
    replaceState,
    selectPokemon,
    syncStateFromHistory,
} from "actions";
import { selectedId } from "../selectedId";
import { generateEmptyPokemon } from "utils";

const pokemon = [
    {
        ...generateEmptyPokemon([]),
        id: "first-pokemon",
    },
    {
        ...generateEmptyPokemon([]),
        id: "second-pokemon",
    },
];

describe("selectedId", () => {
    it("selects pokemon directly", () => {
        expect(selectedId("", selectPokemon("first-pokemon"))).toBe(
            "first-pokemon",
        );
    });

    it("clears the selection when the selected pokemon is deleted", () => {
        expect(
            selectedId("first-pokemon", deletePokemon("first-pokemon")),
        ).toBe("");
    });

    it("keeps the selection when a different pokemon is deleted", () => {
        expect(
            selectedId("first-pokemon", deletePokemon("second-pokemon")),
        ).toBe("first-pokemon");
    });

    it("falls back to a valid pokemon when restored state has a stale selection", () => {
        expect(
            selectedId(
                "missing-pokemon",
                replaceState({
                    pokemon,
                    selectedId: "missing-pokemon",
                }),
            ),
        ).toBe("first-pokemon");
    });

    it("reconciles stale selections during history sync", () => {
        expect(
            selectedId(
                "missing-pokemon",
                syncStateFromHistory({
                    pokemon,
                    selectedId: "missing-pokemon",
                }),
            ),
        ).toBe("first-pokemon");
    });
});
