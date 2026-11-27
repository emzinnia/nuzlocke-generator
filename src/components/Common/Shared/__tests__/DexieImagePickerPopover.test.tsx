import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "utils/testUtils";
import { DexieImagePickerPopover } from "../DexieImagePickerPopover";

const mocks = vi.hoisted(() => {
    return {
        getImagesPage: vi.fn(),
        searchImagesByNamePrefix: vi.fn(),
        uploadImageFiles: vi.fn(),
        showToast: vi.fn(),
    };
});

vi.mock("components/Common/Shared/ImagesDrawer", () => ({
    getImagesPage: mocks.getImagesPage,
    searchImagesByNamePrefix: mocks.searchImagesByNamePrefix,
    uploadImageFiles: mocks.uploadImageFiles,
}));

vi.mock("../appToaster", () => ({
    showToast: mocks.showToast,
}));

describe("<DexieImagePickerPopover />", () => {
    beforeEach(() => {
        mocks.getImagesPage.mockReset();
        mocks.searchImagesByNamePrefix.mockReset();
        mocks.uploadImageFiles.mockReset();
        mocks.showToast.mockReset();
    });

    it("calls onSelect(name) when a thumbnail is clicked", async () => {
        mocks.getImagesPage.mockResolvedValueOnce([
            { id: 1, name: "my-image", image: "data:image/png;base64,abc" },
        ]);

        const onSelect = vi.fn();
        render(<DexieImagePickerPopover onSelect={onSelect} />);

        fireEvent.click(screen.getByLabelText("Pick from uploaded images"));

        await waitFor(() => {
            expect(screen.getByText("my-image")).toBeDefined();
        });

        fireEvent.click(screen.getByTitle("my-image"));

        expect(onSelect).toHaveBeenCalledWith("my-image");
    });

    it("uploads a device image and selects the stored image name", async () => {
        mocks.getImagesPage.mockResolvedValueOnce([]);
        mocks.uploadImageFiles.mockResolvedValueOnce({
            uploaded: [
                {
                    id: 2,
                    name: "device-image.png",
                    image: "data:image/png;base64,abc",
                },
            ],
            tooLarge: [],
            failed: [],
        });

        const onSelect = vi.fn();
        render(<DexieImagePickerPopover onSelect={onSelect} />);

        fireEvent.click(screen.getByLabelText("Pick from uploaded images"));

        await waitFor(() => {
            expect(screen.getByText("No uploaded images yet.")).toBeDefined();
        });

        const file = new File(["image"], "device-image.png", {
            type: "image/png",
        });
        const input = screen.getByLabelText(
            "Upload image from device",
        ) as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mocks.uploadImageFiles).toHaveBeenCalledWith([file]);
            expect(onSelect).toHaveBeenCalledWith("device-image.png");
        });
        expect(mocks.showToast).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Uploaded and selected image.",
            }),
        );
    });
});
