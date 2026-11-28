import * as React from "react";
import { fireEvent, render } from "utils/testUtils";
import { listOfGames, styleDefaults } from "utils";
import { TextAreaDebounced } from "../StyleEditor";
import { vi } from "vitest";

describe("<TextAreaDebounced />", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("captures the textarea value before debouncing the edit", () => {
        vi.useFakeTimers();
        const edit = vi.fn();
        const props = {
            style: styleDefaults,
            editStyle: vi.fn(),
            game: { name: listOfGames[0], customName: "" },
        };
        const { container } = render(
            <TextAreaDebounced
                edit={edit}
                props={props}
                name="customCSS"
            />,
        );

        fireEvent.change(container.querySelector("textarea")!, {
            target: { value: ".team { color: red; }" },
        });
        vi.advanceTimersByTime(300);

        expect(edit).toHaveBeenCalledWith(
            { target: { value: ".team { color: red; }" } },
            props,
            "customCSS",
        );
    });
});
