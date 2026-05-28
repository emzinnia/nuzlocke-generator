import * as React from "react";
import { fireEvent, render, screen } from "utils/testUtils";
import { vi } from "vitest";

import { StyleEditorBase, StyleEditorProps } from "../StyleEditor";
import { styleDefaults } from "utils";

const createProps = (): StyleEditorProps => ({
    style: {
        ...styleDefaults,
        minimalChampsLayout: true,
    },
    editStyle: vi.fn(),
    game: { name: "Gold", customName: "" },
});

describe("<StyleEditor />", () => {
    it("renders a separate Minimal Champs Layout toggle", () => {
        const props = createProps();

        render(<StyleEditorBase {...props} />);

        const checkbox = screen.getByLabelText("Minimal Champs Layout");
        expect(checkbox).toBeDefined();
        expect((checkbox as HTMLInputElement).checked).toBe(true);
    });

    it("updates minimalChampsLayout when the champs toggle changes", () => {
        const props = createProps();

        render(<StyleEditorBase {...props} />);

        fireEvent.click(screen.getByLabelText("Minimal Champs Layout"));

        expect(props.editStyle).toHaveBeenCalledWith({
            minimalChampsLayout: false,
        });
    });
});
