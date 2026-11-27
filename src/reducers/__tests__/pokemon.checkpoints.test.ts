import { deleteCheckpoint, editCheckpoint } from "actions";
import { Pokemon } from "models";
import { pokemon } from "../pokemon";

describe("pokemon checkpoint sync", () => {
    const withCheckpoints = (): Pokemon[] => [
        {
            id: "a",
            species: "Bulbasaur",
            checkpoints: [
                { name: "Boulder Badge", image: "boulder" },
                { name: "Cascade Badge", image: "cascade" },
            ],
        } as Pokemon,
        {
            id: "b",
            species: "Charmander",
            checkpoints: [{ name: "Boulder Badge", image: "boulder" }],
        } as Pokemon,
        {
            id: "c",
            species: "Squirtle",
        } as Pokemon,
    ];

    it("renames per-pokemon cleared checkpoints when a checkpoint is renamed", () => {
        const result = pokemon(
            withCheckpoints(),
            editCheckpoint({ name: "Rock Badge" }, "Boulder Badge"),
        );

        expect(result.find((p) => p.id === "a")?.checkpoints).toEqual([
            { name: "Rock Badge", image: "boulder" },
            { name: "Cascade Badge", image: "cascade" },
        ]);
        expect(result.find((p) => p.id === "b")?.checkpoints).toEqual([
            { name: "Rock Badge", image: "boulder" },
        ]);
        expect(result.find((p) => p.id === "c")?.checkpoints).toBeUndefined();
    });

    it("removes per-pokemon cleared checkpoints when a checkpoint is deleted", () => {
        const result = pokemon(withCheckpoints(), deleteCheckpoint("Boulder Badge"));

        expect(result.find((p) => p.id === "a")?.checkpoints).toEqual([
            { name: "Cascade Badge", image: "cascade" },
        ]);
        expect(result.find((p) => p.id === "b")?.checkpoints).toEqual([]);
        expect(result.find((p) => p.id === "c")?.checkpoints).toBeUndefined();
    });
});
