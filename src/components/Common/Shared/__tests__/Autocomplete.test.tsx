import * as React from "react";
import { fireEvent, render, screen, waitFor } from "utils/testUtils";
import { Autocomplete } from "..";
import { vi } from "vitest";

describe("<Autcomplete />", () => {
    it("renders its contents", () => {
        const component = (
            <Autocomplete
                value={"test"}
                onChange={() => {}}
                items={["test", "test2", "test-2"]}
            />
        );
        render(component);
        expect(screen).toBeDefined();
    });

    describe("keyboard navigation", () => {
        const scrollIntoViewMock = vi.fn();

        beforeAll(() => {
            // jsdom does not implement scrollIntoView; stub so we can assert calls
            window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
        });

        beforeEach(() => {
            scrollIntoViewMock.mockClear();
        });

        it("keeps the highlighted option in view when moving with arrows", async () => {
            const items = Array.from({ length: 10 }, (_v, i) => `item-${i}`);

            render(
                <Autocomplete
                    value=""
                    onChange={() => {}}
                    items={items}
                />,
            );

            const input = screen.getByTestId("autocomplete");

            fireEvent.focus(input);
            fireEvent.keyDown(input, { key: "ArrowDown", which: 40 });

            await waitFor(() => {
                expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
            });

            fireEvent.keyDown(input, { key: "ArrowDown", which: 40 });

            await waitFor(() => {
                expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
            });

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                block: "nearest",
            });
        });
    });
});
