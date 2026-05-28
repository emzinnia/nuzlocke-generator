import { listOfPokeballs, formatBallText } from "utils";

describe("Pokeball data", () => {
    it("includes Strange Ball with a matching icon filename", () => {
        expect(listOfPokeballs).toContain("strange");
        expect(formatBallText("Strange Ball")).toBe("strange");
    });
});
