import { HistoryEntry, Pokemon, PokemonKeys, Trainer, TrainerKeys } from "..";

describe("Models", () => {
    describe("Pokemon", () => {
        it("returns a Pokemon object", () => {
            const poke = PokemonKeys;
            expect(poke.position).toBeDefined();
            expect(poke.species).toBeDefined();
            expect(typeof poke.species).toBe("string");
            expect(typeof poke.shiny).toBe("boolean");
            expect(typeof poke.level).toBe("number");
        });
    });

    describe("Trainer", () => {
        it("returns a Trainer object", () => {
            const trainer = TrainerKeys;
            expect(Array.isArray(trainer.badges)).toBe(true);
            expect(typeof trainer.time).toBe("string");
            // NOTE: Hardcoded value
            expect(trainer.id).toBe("00123");
        });
    });
});
