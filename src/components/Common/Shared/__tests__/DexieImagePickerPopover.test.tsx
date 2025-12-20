import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "utils/testUtils";
import { DexieImagePickerPopover } from "../DexieImagePickerPopover";

const mocks = vi.hoisted(() => {
    return {
        getImagesPage: vi.fn(),
        searchImagesByNamePrefix: vi.fn(),
    };
});

vi.mock("components/Common/Shared/ImagesDrawer", () => ({
    getImagesPage: mocks.getImagesPage,
    searchImagesByNamePrefix: mocks.searchImagesByNamePrefix,
}));

describe("<DexieImagePickerPopover />", () => {
    beforeEach(() => {
        mocks.getImagesPage.mockReset();
        mocks.searchImagesByNamePrefix.mockReset();
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
});


