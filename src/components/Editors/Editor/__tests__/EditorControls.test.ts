import { describe, expect, it } from "vitest";
import { isRedoHotkey, isUndoHotkey } from "../EditorControls";

const keyEvent = (
    overrides: Partial<KeyboardEvent>,
): Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "key"> => ({
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: "",
    ...overrides,
});

describe("<EditorControls /> hotkeys", () => {
    it("keeps plain Ctrl+Z exclusive to undo", () => {
        const event = keyEvent({ ctrlKey: true, key: "z" });

        expect(isUndoHotkey(event)).toBe(true);
        expect(isRedoHotkey(event)).toBe(false);
    });

    it("treats Ctrl+Shift+Z as redo without also matching undo", () => {
        const event = keyEvent({ ctrlKey: true, shiftKey: true, key: "Z" });

        expect(isUndoHotkey(event)).toBe(false);
        expect(isRedoHotkey(event)).toBe(true);
    });

    it("supports Ctrl+Y and Cmd+Y redo shortcuts", () => {
        expect(isRedoHotkey(keyEvent({ ctrlKey: true, key: "y" }))).toBe(true);
        expect(isRedoHotkey(keyEvent({ metaKey: true, key: "Y" }))).toBe(true);
    });
});
