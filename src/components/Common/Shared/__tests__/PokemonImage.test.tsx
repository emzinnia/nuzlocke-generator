import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "utils/testUtils";
import { PokemonImage } from "../PokemonImage";

const mocks = vi.hoisted(() => {
    return {
        getImageByName: vi.fn(),
    };
});

vi.mock("components/Common/Shared/ImagesDrawer", () => ({
    getImageByName: mocks.getImageByName,
}));

describe("<PokemonImage />", () => {
    it("resolves url-as-name via Dexie (getImageByName) before falling back to remote fetch", async () => {
        mocks.getImageByName.mockResolvedValueOnce({
            id: 1,
            name: "my-image",
            image: "data:image/png;base64,abc",
        });

        render(<PokemonImage url="my-image" />);

        await waitFor(() => {
            const img = screen.getByRole("img");
            expect(img.getAttribute("src")).toBe("data:image/png;base64,abc");
        });
    });
});


