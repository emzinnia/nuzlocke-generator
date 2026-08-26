import * as React from "react";
import { fireEvent, render, screen } from "utils/testUtils";
import { vi } from "vitest";
import { AdvancedImportOptions } from "../AdvancedImportOptions";

const renderAdvancedImportOptions = () =>
    render(
        <AdvancedImportOptions
            boxes={[]}
            isDarkMode={false}
            onFileSelect={vi.fn()}
            onShowdownImport={vi.fn()}
        />,
    );

const getGameOptions = () => {
    fireEvent.click(screen.getByText("Advanced Import Options"));
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    return Array.from(select.options).map((option) => option.value);
};

describe("<AdvancedImportOptions />", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("shows Gen 4 save formats by default", () => {
        renderAdvancedImportOptions();

        expect(getGameOptions()).toEqual(
            expect.arrayContaining(["DP", "Platinum", "HGSS"]),
        );
    });

    it("allows Gen 4 save formats to be explicitly disabled", () => {
        vi.stubEnv("VITE_GEN4_SAVES", "false");

        renderAdvancedImportOptions();

        expect(getGameOptions()).not.toEqual(
            expect.arrayContaining(["DP", "Platinum", "HGSS"]),
        );
    });
});
