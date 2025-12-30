import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../Dialog";

const renderOpenDialog = (props: Partial<React.ComponentProps<typeof Dialog>> = {}) =>
    render(
        <Dialog isOpen onClose={props.onClose ?? vi.fn()} title="Title" {...props}>
            Body content
        </Dialog>,
    );

describe("<Dialog />", () => {
    it("renders in a portal with title, close button, and body", () => {
        const onClose = vi.fn();
        renderOpenDialog({ onClose, icon: "info-sign" });

        const dialog = screen.getByRole("dialog", { name: "Title" });
        expect(dialog.textContent).toContain("Body content");
        expect(screen.getByLabelText("Close")).toBeTruthy();

        fireEvent.click(screen.getByLabelText("Close"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape when allowed and ignores when disabled", () => {
        const onClose = vi.fn();
        renderOpenDialog({ onClose });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);

        const onCloseBlocked = vi.fn();
        renderOpenDialog({ onClose: onCloseBlocked, canEscapeKeyClose: false });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCloseBlocked).not.toHaveBeenCalled();
    });

    it("closes on outside click but not when clicking inside content", () => {
        const onClose = vi.fn();
        renderOpenDialog({ onClose });

        const dialog = screen.getByRole("dialog");
        const overlay = dialog.parentElement as HTMLElement; // click handler lives here

        fireEvent.click(dialog);
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("toggles body scrolling when opened and closed", () => {
        const { rerender } = render(
            <Dialog isOpen onClose={() => {}}>
                Body
            </Dialog>,
        );

        expect(document.body.style.overflow).toBe("hidden");

        rerender(
            <Dialog isOpen={false} onClose={() => {}}>
                Body
            </Dialog>,
        );

        expect(document.body.style.overflow).toBe("");
    });

    it("can hide the close button and prevent outside click closing", () => {
        const onClose = vi.fn();
        renderOpenDialog({ onClose, isCloseButtonShown: false, canOutsideClickClose: false });

        expect(screen.queryByLabelText("Close")).toBeNull();

        const dialog = screen.getByRole("dialog");
        const overlay = dialog.parentElement as HTMLElement;

        fireEvent.click(overlay);
        expect(onClose).not.toHaveBeenCalled();
    });
});

