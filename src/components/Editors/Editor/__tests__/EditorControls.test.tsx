import { describe, expect, it } from "vitest";
import { isRedoHotkey, isUndoHotkey } from "../EditorControls";

const keyboardEvent = (
    event: Partial<KeyboardEvent>,
): Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "key"> => ({
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: "",
    ...event,
});

describe("EditorControls hotkeys", () => {
    it("treats plain Ctrl+Z as undo only", () => {
        const event = keyboardEvent({ ctrlKey: true, key: "z" });

        expect(isUndoHotkey(event)).toBe(true);
        expect(isRedoHotkey(event)).toBe(false);
    });

    it("treats Ctrl+Shift+Z as redo only", () => {
        const event = keyboardEvent({
            ctrlKey: true,
            shiftKey: true,
            key: "Z",
        });

        expect(isUndoHotkey(event)).toBe(false);
        expect(isRedoHotkey(event)).toBe(true);
    });

    it("keeps Ctrl+Y as redo", () => {
        const event = keyboardEvent({ ctrlKey: true, key: "y" });

        expect(isRedoHotkey(event)).toBe(true);
    });
});
