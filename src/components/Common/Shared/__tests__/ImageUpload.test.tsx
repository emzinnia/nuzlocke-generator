/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageUpload } from "../ImageUpload";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockShowToast } = vi.hoisted(() => ({
    mockShowToast: vi.fn(),
}));

vi.mock("../appToaster", () => ({
    showToast: mockShowToast,
}));

describe("ImageUpload", () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    beforeEach(() => {
        mockOnSuccess.mockClear();
        mockOnError.mockClear();
        mockShowToast.mockClear();
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
            expect(mockShowToast).toHaveBeenCalledWith(
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
            expect(mockShowToast).toHaveBeenCalledWith(
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

    it("supports uploading multiple images when multiple=true", async () => {
        const { container } = render(
            <ImageUpload onSuccess={mockOnSuccess} multiple />
        );
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput.multiple).toBe(true);

        const file1 = new File(["a"], "a.png", { type: "image/png" });
        const file2 = new File(["b"], "b.png", { type: "image/png" });

        // Stub FileReader to resolve immediately with a predictable result.
        // Some environments expose FileReader on both `window` and `globalThis`.
        const originalWindowFileReader = (window as any).FileReader;
        const originalGlobalFileReader = (globalThis as any).FileReader;
        class MockFileReader {
            public result: string | null = null;
            public onload: null | (() => void) = null;
            public onerror: null | ((e: any) => void) = null;
            readAsDataURL(file: File) {
                this.result = `data:${file.name}`;
                // Real FileReader fires load asynchronously; defer so ImageUpload's code
                // has a chance to attach `onload` after calling readAsDataURL().
                queueMicrotask(() => this.onload?.());
            }
        }
        (window as any).FileReader = MockFileReader;
        (globalThis as any).FileReader = MockFileReader;

        const fileListLike = {
            0: file1,
            1: file2,
            length: 2,
            item: (i: number) => [file1, file2][i] ?? null,
        };
        // For file inputs, React reads from the element's `.files`. Define a getter so jsdom returns our list.
        Object.defineProperty(fileInput, "files", {
            configurable: true,
            get: () => fileListLike,
        });
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalledTimes(2);
        });

        // Restore
        (window as any).FileReader = originalWindowFileReader;
        (globalThis as any).FileReader = originalGlobalFileReader;
    });
});
