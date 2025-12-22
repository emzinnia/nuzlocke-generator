import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BoxFormBase } from "../BoxForm";

const addBox = vi.fn();

const baseProps = {
    boxes: [],
    addBox: addBox as any,
    style: { editorDarkMode: false },
};

describe("<BoxFormBase />", () => {
    beforeEach(() => addBox.mockClear());

    it("toggles form and submits new box", () => {
        const { getByRole, getByPlaceholderText, getByText } = render(
            <BoxFormBase {...baseProps} />,
        );

        fireEvent.click(getByRole("button"));

        fireEvent.input(getByPlaceholderText("Box Name"), {
            target: { value: "Legends" },
        });

        fireEvent.click(getByText("Confirm"));

        expect(addBox).toHaveBeenCalledWith({
            name: "Legends",
            background: "grass-meadow",
            inheritFrom: "Team",
        });
    });
});

