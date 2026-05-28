import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react";

import { TextAreaDebounced } from "../StyleEditor";
import { styleDefaults } from "utils";

describe("<TextAreaDebounced />", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("saves the latest textarea value after the debounce delay", () => {
        const editStyle = vi.fn();
        const props = {
            style: {
                ...styleDefaults,
                customCSS: "",
            },
            editStyle,
        };

        const { container } = render(
            <TextAreaDebounced
                edit={(event, editorProps, name) => {
                    const target = event.target as { value: string };
                    editorProps.editStyle({
                        [name as string]: target.value,
                    });
                }}
                props={
                    props as unknown as React.ComponentProps<
                        typeof TextAreaDebounced
                    >["props"]
                }
                name="customCSS"
            />,
        );

        const textarea = container.querySelector("textarea");
        if (!textarea) throw new Error("Expected textarea to render");

        fireEvent.change(textarea, {
            target: {
                value: '@import url("https://fonts.googleapis.com/css2?family=Karla");',
            },
        });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(editStyle).toHaveBeenCalledWith({
            customCSS:
                '@import url("https://fonts.googleapis.com/css2?family=Karla");',
        });
    });
});
