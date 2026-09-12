import { normalizeAreaLines } from "../PokemonLocationChecklist";

describe("normalizeAreaLines", () => {
    it("trims custom route lines and removes blanks", () => {
        expect(
            normalizeAreaLines(" Route 1 \n\nGale Forest\n Old Graveyard "),
        ).toEqual(["Route 1", "Gale Forest", "Old Graveyard"]);
    });
});

