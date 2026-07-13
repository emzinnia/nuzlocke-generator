import { changeEditorSize } from "actions";
import { editor } from "../editor";

describe("editor", () => {
    it("preserves editor preferences when changing minimized state", () => {
        const state = {
            minimized: false,
            temtemMode: true,
            showResultInMobile: true,
            monsterType: "TemTem",
        };

        expect(editor(state, changeEditorSize(true))).toEqual({
            ...state,
            minimized: true,
        });
    });
});
