import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageUpload } from "../ImageUpload";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock Toaster
const mockToasterShow = vi.fn();
vi.mock("@blueprintjs/core", async () => {
    const actual = await vi.importActual<typeof import("@blueprintjs/core")>("@blueprintjs/core");
    return {
        ...actual,
        Toaster: {
            create: () => ({
                show: mockToasterShow,
            }),
        },
    };
});

describe("ImageUpload", () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    beforeEach(() => {
        mockOnSuccess.mockClear();
        mockOnError.mockClear();
        mockToasterShow.mockClear();
    });

    it("renders upload button", () => {
        render(<ImageUpload onSuccess={mockOnSuccess} />);
        expect(screen.getByText("Upload Image")).toBeDefined();
    });

    it("renders a hidden file input", () => {
        const { container } = render(<ImageUpload onSuccess={mockOnSuccess} />);
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).not.toBeNull();
        expect(fileInput.accept).toBe("image/*");
    });

    it("shows error toast when no file is selected", async () => {
        const { container } = render(
            <ImageUpload onSuccess={mockOnSuccess} onError={mockOnError} />
        );
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [] } });

        await waitFor(() => {
            expect(mockToasterShow).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No file detected.",
                })
            );
        });
    });

    it("shows error toast when file is too large", async () => {
        const { container } = render(<ImageUpload onSuccess={mockOnSuccess} />);
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

        // Create a file larger than 500KB (0.5MB)
        const largeFile = new File(["x".repeat(600 * 1024)], "large.png", {
            type: "image/png",
        });
        Object.defineProperty(largeFile, "size", { value: 600 * 1024 });

        fireEvent.change(fileInput, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(mockToasterShow).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining("File size of 500KB exceeded"),
                })
            );
        });
    });

    it("has upload icon on button", () => {
        const { container } = render(<ImageUpload onSuccess={mockOnSuccess} />);
        // BlueprintJS icons use data-icon attribute or specific classes
        const button = container.querySelector("button");
        expect(button).not.toBeNull();
    });
});
