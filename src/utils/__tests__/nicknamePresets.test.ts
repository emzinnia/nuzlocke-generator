import { parseNicknamePresetText } from "utils";

describe("parseNicknamePresetText", () => {
    it("accepts newline and comma separated preset names", () => {
        expect(parseNicknamePresetText("Briar\nNova, Sage")).toEqual([
            "Briar",
            "Nova",
            "Sage",
        ]);
    });

    it("trims blanks and keeps the first instance of duplicate names", () => {
        expect(parseNicknamePresetText("  Briar  \n\nBriar, Nova ")).toEqual([
            "Briar",
            "Nova",
        ]);
    });
});
