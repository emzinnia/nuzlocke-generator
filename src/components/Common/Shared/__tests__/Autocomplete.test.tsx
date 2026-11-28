import * as React from "react";
import { fireEvent, render, screen, waitFor } from "utils/testUtils";
import { Autocomplete } from "..";
import { vi } from "vitest";

describe("<Autcomplete />", () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

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

    it("keeps in-progress text when the suggestion list is a new array", () => {
        const locations = ["Route 1", "Viridian Forest"];

        const Harness = () => {
            const [nonce, setNonce] = React.useState(0);

            return (
                <>
                    <button type="button" onClick={() => setNonce((n) => n + 1)}>
                        rerender {nonce}
                    </button>
                    <Autocomplete
                        value=""
                        onChange={() => {}}
                        items={[...locations]}
                    />
                </>
            );
        };

        render(<Harness />);
        const input = screen.getByTestId("autocomplete") as HTMLInputElement;

        fireEvent.change(input, { target: { value: "Vi" } });
        expect(input.value).toBe("Vi");

        fireEvent.click(screen.getByRole("button", { name: /rerender/ }));

        expect(input.value).toBe("Vi");
    });

    it("keeps characters typed after that refresh in the saved value", () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const locations = ["Route 1", "Viridian Forest"];

        const Harness = () => {
            const [nonce, setNonce] = React.useState(0);

            return (
                <>
                    <button type="button" onClick={() => setNonce((n) => n + 1)}>
                        rerender {nonce}
                    </button>
                    <Autocomplete
                        value=""
                        onChange={onChange}
                        items={[...locations]}
                    />
                </>
            );
        };

        render(<Harness />);
        const input = screen.getByTestId("autocomplete") as HTMLInputElement;

        fireEvent.change(input, { target: { value: "Vi" } });
        fireEvent.click(screen.getByRole("button", { name: /rerender/ }));
        fireEvent.change(input, { target: { value: `${input.value}r` } });

        vi.advanceTimersByTime(300);

        expect(onChange).toHaveBeenCalledWith({ target: { value: "Vir" } });
    });

    it("still replaces the field when the stored value changes", () => {
        const locations = ["Old Route", "New Route"];
        const { rerender } = render(
            <Autocomplete
                value="Old Route"
                onChange={() => {}}
                items={[...locations]}
            />,
        );
        const input = screen.getByTestId("autocomplete") as HTMLInputElement;

        expect(input.value).toBe("Old Route");

        rerender(
            <Autocomplete
                value="New Route"
                onChange={() => {}}
                items={[...locations]}
            />,
        );

        expect(input.value).toBe("New Route");
    });

    it("can be reopened after closing (clears pending blur close timeout)", async () => {
        vi.useFakeTimers();

        const items = ["item-0", "item-1", "item-2"];
        render(<Autocomplete value="" onChange={() => {}} items={items} />);

        const input = screen.getByTestId("autocomplete");

        // Open
        fireEvent.focus(input);
        expect(document.querySelector(".autocomplete-items")).not.toBeNull();

        // Trigger blur close (which is delayed)
        fireEvent.blur(input);

        // Immediately reopen; should cancel the pending close
        fireEvent.focus(input);
        expect(document.querySelector(".autocomplete-items")).not.toBeNull();

        // Even after timers flush, it should remain open
        vi.runAllTimers();

        await waitFor(() => {
            expect(document.querySelector(".autocomplete-items")).not.toBeNull();
        });
    });
});
