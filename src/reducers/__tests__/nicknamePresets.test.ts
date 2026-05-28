import { replaceState, syncStateFromHistory, updateNicknamePresets } from "actions";
import { nicknamePresets } from "../nicknamePresets";

describe("nicknamePresets", () => {
    it("updates the preset name list", () => {
        expect(nicknamePresets([], updateNicknamePresets(["Sage"]))).toEqual([
            "Sage",
        ]);
    });

    it("restores preset names from imported state", () => {
        expect(
            nicknamePresets(["Old"], replaceState({ nicknamePresets: ["Nova"] })),
        ).toEqual(["Nova"]);
    });

    it("restores preset names from editor history", () => {
        expect(
            nicknamePresets(
                ["Old"],
                syncStateFromHistory({ nicknamePresets: ["Briar"] }),
            ),
        ).toEqual(["Briar"]);
    });
});
