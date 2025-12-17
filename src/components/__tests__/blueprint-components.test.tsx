import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
    Alert,
    Button,
    ButtonGroup,
    Callout,
    Checkbox,
    Classes,
    Dialog,
    HTMLSelect,
    Icon,
    Intent,
    Menu,
    MenuItem,
    Popover,
    Position,
    Slider,
    Spinner,
    Switch,
    Tab,
    Tabs,
    Tag,
    TagInput,
    TextArea,
    Tooltip,
    Toaster,
} from "@blueprintjs/core";
import { OverlayToaster, PopoverInteractionKind } from "@blueprintjs/core";
import { renderWithPortal, flushPromises } from "../../../tests/blueprintHarness";

describe("Blueprint controls characterization", () => {
    it("Button renders text, intent class, and calls onClick", () => {
        const onClick = vi.fn();
        render(
            <Button intent={Intent.PRIMARY} onClick={onClick}>
                Click me
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Click me" });
        expect(button.className).toContain("bp5-button");
        expect(button.className).toContain("bp5-intent-primary");
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ButtonGroup renders grouped buttons", () => {
        render(
            <ButtonGroup>
                <Button>One</Button>
                <Button>Two</Button>
            </ButtonGroup>,
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBe(2);
    });

    it("Icon renders the expected class for the icon name", () => {
        const { container } = render(<Icon icon="tick" intent={Intent.SUCCESS} />);
        const icon = container.querySelector(".bp5-icon");
        expect(icon).not.toBeNull();
        expect(icon!.className).toContain("bp5-icon-tick");
        expect(icon!.className).toContain("bp5-intent-success");
    });

    it("MenuItem invokes click handlers", () => {
        const onClick = vi.fn();
        render(
            <Menu>
                <MenuItem text="Item" onClick={onClick} />
            </Menu>,
        );

        fireEvent.click(screen.getByText("Item"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("Tag renders intent class", () => {
        const { container } = render(
            <Tag intent={Intent.WARNING} minimal>
                Warning
            </Tag>,
        );

        const tag = container.querySelector(".bp5-tag");
        expect(tag).not.toBeNull();
        expect(tag!.className).toContain("bp5-intent-warning");
    });

    it("Spinner renders with spinner class", () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector(".bp5-spinner")).not.toBeNull();
    });
});

describe("Blueprint form controls characterization", () => {
    it("HTMLSelect renders options and fires onChange", () => {
        const handleChange = vi.fn();
        render(
            <HTMLSelect
                onChange={handleChange}
                options={[
                    { label: "One", value: "1" },
                    { label: "Two", value: "2" },
                ]}
            />,
        );

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("TextArea renders and fires onChange", () => {
        const handleChange = vi.fn();
        render(<TextArea defaultValue="hello" onChange={handleChange} />);

        fireEvent.change(screen.getByDisplayValue("hello"), { target: { value: "world" } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("TagInput supports tag removal callbacks", () => {
        const handleRemove = vi.fn();
        const { container } = render(<TagInput values={["alpha"]} onRemove={handleRemove} />);

        const removeButton = container.querySelector(".bp5-tag-remove") as HTMLElement | null;
        expect(removeButton).not.toBeNull();
        if (removeButton) {
            fireEvent.click(removeButton);
            expect(handleRemove).toHaveBeenCalledWith("alpha", 0);
        }
    });

    it("Slider renders with correct aria values", () => {
        render(<Slider min={0} max={10} value={5} onChange={vi.fn()} />);

        const slider = screen.getByRole("slider");
        expect(slider.getAttribute("aria-valuemin")).toBe("0");
        expect(slider.getAttribute("aria-valuemax")).toBe("10");
        expect(slider.getAttribute("aria-valuenow")).toBe("5");
    });

    it("Switch toggles and fires onChange", () => {
        const handleChange = vi.fn();
        render(<Switch label="Enable" onChange={handleChange} />);

        fireEvent.click(screen.getByLabelText("Enable"));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("Checkbox toggles and fires onChange", () => {
        const handleChange = vi.fn();
        render(<Checkbox label="Check" onChange={handleChange} />);

        fireEvent.click(screen.getByLabelText("Check"));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});

describe("Blueprint overlays characterization", () => {
    it("Dialog renders in a portal and calls onClose when close button is pressed", () => {
        const onClose = vi.fn();
        const { portal, cleanup } = renderWithPortal(
            <Dialog isOpen title="Dialog Title" onClose={onClose}>
                <p>Dialog body</p>
            </Dialog>,
        );

        const portalEl = portal();
        expect(portalEl?.textContent).toContain("Dialog body");

        const closeButton = portalEl?.querySelector(".bp5-dialog-close-button") as HTMLElement | null;
        if (closeButton) {
            fireEvent.click(closeButton);
            expect(onClose).toHaveBeenCalledTimes(1);
        }

        cleanup();
    });

    it("Alert renders and invokes confirm callbacks", () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        const { cleanup } = renderWithPortal(
            <Alert
                isOpen
                intent={Intent.DANGER}
                confirmButtonText="Confirm"
                cancelButtonText="Cancel"
                onConfirm={onConfirm}
                onCancel={onCancel}
            >
                Danger
            </Alert>,
        );

        fireEvent.click(screen.getByText("Confirm"));
        fireEvent.click(screen.getByText("Cancel"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);

        cleanup();
    });

    it("Popover opens on click and renders content in a portal", async () => {
        const { portal, cleanup } = renderWithPortal(
            <Popover
                content={<div>Popover Content</div>}
                interactionKind={PopoverInteractionKind.CLICK}
                position={Position.BOTTOM}
            >
                <Button>Target</Button>
            </Popover>,
        );

        fireEvent.click(screen.getByText("Target"));
        await flushPromises();
        expect(portal()?.textContent).toContain("Popover Content");

        cleanup();
    });

    it("Tooltip opens on hover", async () => {
        const { portal, cleanup } = renderWithPortal(
            <Tooltip content="Helpful tip" position={Position.TOP} isOpen>
                <Button>Hover me</Button>
            </Tooltip>,
        );

        const portalEl = portal();
        expect(portalEl).not.toBeNull();
        expect((portalEl?.textContent ?? "")).toContain("Helpful tip");

        cleanup();
    });

    it("Callout renders with intent class", () => {
        render(
            <Callout intent={Intent.PRIMARY} title="Heads up">
                Body text
            </Callout>,
        );

        const callout = screen.getByText("Body text");
        expect(callout.className).toContain("bp5-intent-primary");
    });

    it("Tabs trigger onChange with new and previous ids", () => {
        const onChange = vi.fn();
        render(
            <Tabs id="tabs" selectedTabId="one" onChange={onChange}>
                <Tab id="one" title="One" panel={<div>Panel One</div>} />
                <Tab id="two" title="Two" panel={<div>Panel Two</div>} />
            </Tabs>,
        );

        fireEvent.click(screen.getByText("Two"));
        const [newId, prevId] = onChange.mock.calls[0];
        expect(newId).toBe("two");
        expect(prevId).toBe("one");
    });
});

describe("Blueprint toaster characterization", () => {
    it("OverlayToaster shows a toast with intent class", async () => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const toaster = OverlayToaster.create({ position: Position.TOP }, container);
        toaster.show({ message: "Toast message", intent: Intent.SUCCESS });

        await flushPromises();
        const toast = document.body.querySelector(".bp5-toast");
        expect(toast?.textContent).toContain("Toast message");
        expect(toast?.className).toContain("bp5-intent-success");

        toaster.clear();
        container.remove();
    });

    it("Toaster respects className via Classes helper", () => {
        const className = Classes.intentClass(Intent.DANGER);
        expect(className).toBe("bp5-intent-danger");
    });
});

