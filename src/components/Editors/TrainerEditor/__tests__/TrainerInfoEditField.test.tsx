import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "utils/testUtils";
import { TrainerInfoEditField } from "../TrainerInfoEditField";

describe("<TrainerInfoEditField />", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("cancels pending edits and resets when the external value changes", () => {
        const onEdit = vi.fn();
        const { rerender } = render(
            <TrainerInfoEditField
                label="Name"
                name="name"
                placeholder="Trainer name"
                value="A Save"
                onEdit={onEdit}
            />,
        );
        const input = screen.getByRole("textbox") as HTMLInputElement;

        fireEvent.change(input, { target: { value: "Stale Edit" } });
        expect(input.value).toBe("Stale Edit");

        rerender(
            <TrainerInfoEditField
                label="Name"
                name="name"
                placeholder="Trainer name"
                value="B Save"
                onEdit={onEdit}
            />,
        );
        vi.advanceTimersByTime(301);

        expect(input.value).toBe("B Save");
        expect(onEdit).not.toHaveBeenCalled();
    });
});
