import * as React from "react";
import { render, screen } from "utils/testUtils";
import { describe, it, expect } from "vitest";
import { HotkeyIndicator } from "..";

describe("<HotkeyIndicator />", () => {
    it("renders Shift as a glyph (⇧) when included in the hotkey string", () => {
        render(<HotkeyIndicator hotkey="shift+m" showModifier={false} />);
        expect(screen.getByText("⇧M")).toBeDefined();
    });

    it("renders Ctrl+⇧ for Shift combos when a custom modifier is provided", () => {
        render(<HotkeyIndicator hotkey="Shift + z" modifier="Ctrl+" />);
        expect(screen.getByText("Ctrl+⇧Z")).toBeDefined();
    });
});


