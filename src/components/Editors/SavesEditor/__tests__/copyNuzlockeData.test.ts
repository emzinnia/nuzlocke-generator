import { copyNuzlockeData } from "../copyNuzlockeData";
import { createDefaultState } from "store";
import { State } from "state";

const createState = (overrides: Partial<State>): State => ({
    ...createDefaultState(),
    ...overrides,
});

describe("copyNuzlockeData", () => {
    it("copies pokemon and updates selectedId from the source save", () => {
        const target = createState({
            selectedId: "target-selected",
            pokemon: [
                {
                    id: "target-selected",
                    species: "Pikachu",
                    status: "Team",
                },
            ],
            box: [{ id: 0, name: "Team", position: 0 }],
        });
        const source = createState({
            selectedId: "source-selected",
            pokemon: [
                {
                    id: "source-selected",
                    species: "Charizard",
                    status: "Champs",
                },
            ],
            box: [{ id: 9, name: "Legacy Champs", position: 0 }],
        });

        const result = copyNuzlockeData(target, source, "pokemon");

        expect(result.pokemon).toEqual(source.pokemon);
        expect(result.pokemon).not.toBe(source.pokemon);
        expect(result.selectedId).toBe("source-selected");
        expect(result.box).toEqual(target.box);
    });

    it("copies boxes without replacing pokemon", () => {
        const target = createState({
            selectedId: "target-selected",
            pokemon: [{ id: "target-selected", species: "Eevee" }],
            box: [{ id: 0, name: "Team", position: 0 }],
        });
        const source = createState({
            selectedId: "source-selected",
            pokemon: [{ id: "source-selected", species: "Vaporeon" }],
            box: [{ id: 4, name: "Genlocke Champs", position: 1 }],
        });

        const result = copyNuzlockeData(target, source, "boxes");

        expect(result.box).toEqual(source.box);
        expect(result.box).not.toBe(source.box);
        expect(result.pokemon).toEqual(target.pokemon);
        expect(result.selectedId).toBe("target-selected");
    });

    it("copies boxes and pokemon together", () => {
        const target = createState({
            selectedId: "target-selected",
            pokemon: [{ id: "target-selected", species: "Bulbasaur" }],
            box: [{ id: 0, name: "Team", position: 0 }],
        });
        const source = createState({
            selectedId: "source-selected",
            pokemon: [{ id: "source-selected", species: "Blastoise" }],
            box: [{ id: 2, name: "Transferred", position: 3 }],
        });

        const result = copyNuzlockeData(target, source, "boxes-and-pokemon");

        expect(result.box).toEqual(source.box);
        expect(result.pokemon).toEqual(source.pokemon);
        expect(result.selectedId).toBe("source-selected");
    });

    it("falls back to the first copied pokemon when source selectedId is missing", () => {
        const target = createState({
            selectedId: "target-selected",
            pokemon: [{ id: "target-selected", species: "Bulbasaur" }],
        });
        const source = createState({
            selectedId: "missing",
            pokemon: [
                { id: "first-source", species: "Squirtle" },
                { id: "second-source", species: "Wartortle" },
            ],
        });

        const result = copyNuzlockeData(target, source, "pokemon");

        expect(result.selectedId).toBe("first-source");
    });
});

