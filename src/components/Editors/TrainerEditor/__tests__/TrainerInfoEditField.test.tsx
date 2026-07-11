import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "utils/testUtils";
import { TrainerInfoEditField } from "../TrainerInfoEditField";

describe("<TrainerInfoEditField />", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("clears stale local input and cancels pending edits when external state resets", () => {
        vi.useFakeTimers();
        const onEdit = vi.fn();
        const { rerender } = render(
            <TrainerInfoEditField
                label="Trainer Name"
                name="name"
                placeholder="Trainer Name"
                value="Original"
                onEdit={onEdit}
            />,
        );
        const input = screen.getByPlaceholderText(
            "Trainer Name",
        ) as HTMLInputElement;

        fireEvent.change(input, {
            target: { value: "Manual Hotkey Test" },
        });
        expect(input.value).toBe("Manual Hotkey Test");

        rerender(
            <TrainerInfoEditField
                label="Trainer Name"
                name="name"
                placeholder="Trainer Name"
                value={undefined}
                onEdit={onEdit}
            />,
        );

        expect(input.value).toBe("");

        act(() => {
            vi.advanceTimersByTime(350);
        });
        expect(onEdit).not.toHaveBeenCalled();
    });
});
