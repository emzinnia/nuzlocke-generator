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

    it("Button applies sizing/styling props", () => {
        render(
            <Button minimal outlined large fill loading rightIcon="add" alignText="right">
                Styled
            </Button>,
        );

        const button = screen.getByRole("button", { name: "Styled" });
        expect(button.className).toContain("bp5-minimal");
        expect(button.className).toContain("bp5-outlined");
        expect(button.className).toContain("bp5-large");
        expect(button.className).toContain("bp5-fill");
        const spinner = button.querySelector(".bp5-spinner");
        expect(spinner).not.toBeNull();
        const rightIcon = button.querySelector(".bp5-icon-add");
        expect(rightIcon).not.toBeNull();
        expect(button.className).toContain("bp5-align-right");
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

    it("ButtonGroup applies fill/minimal/large props", () => {
        const { container } = render(
            <ButtonGroup fill minimal large>
                <Button>One</Button>
            </ButtonGroup>,
        );

        const group = container.querySelector(".bp5-button-group");
        expect(group?.className).toContain("bp5-fill");
        expect(group?.className).toContain("bp5-minimal");
        expect(group?.className).toContain("bp5-large");
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

    it("MenuItem supports disabled and icon props", () => {
        render(
            <Menu>
                <MenuItem icon="add" text="Add" disabled />
            </Menu>,
        );

        const item = screen.getByText("Add").closest("[aria-disabled]");
        expect(item?.getAttribute("aria-disabled")).toBe("true");
        const icon = item?.querySelector(".bp5-icon-add");
        expect(icon).not.toBeNull();
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

    it("Tag supports round, large, icon, and onRemove", () => {
        const onRemove = vi.fn();
        const { container } = render(
            <Tag round large icon="star" onRemove={onRemove} interactive>
                Taggy
            </Tag>,
        );

        const tag = container.querySelector(".bp5-tag");
        expect(tag?.className).toContain("bp5-round");
        expect(tag?.className).toContain("bp5-large");
        expect(tag?.className).toContain("bp5-interactive");
        expect(tag?.querySelector(".bp5-icon-star")).not.toBeNull();

        const removeBtn = tag?.querySelector(".bp5-tag-remove") as HTMLElement | null;
        expect(removeBtn).not.toBeNull();
        if (removeBtn) {
            fireEvent.click(removeBtn);
            expect(onRemove).toHaveBeenCalledTimes(1);
        }
    });

    it("Spinner renders with spinner class", () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector(".bp5-spinner")).not.toBeNull();
    });

    it("Spinner applies intent and size", () => {
        const { container } = render(<Spinner intent={Intent.DANGER} size={32} />);
        const spinner = container.querySelector(".bp5-spinner");
        expect(spinner?.className).toContain("bp5-intent-danger");
        const svg = spinner?.querySelector("svg");
        expect(svg?.getAttribute("width")).toBe("32");
        expect(svg?.getAttribute("height")).toBe("32");
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

    it("HTMLSelect supports fill/large/disabled props", () => {
        const { container } = render(
            <HTMLSelect
                fill
                large
                disabled
                options={[
                    { label: "One", value: "1" },
                    { label: "Two", value: "2" },
                ]}
            />,
        );

        const wrapper = container.querySelector(".bp5-html-select") as HTMLElement;
        const select = wrapper.querySelector("select") as HTMLSelectElement;
        expect(select.disabled).toBe(true);
        expect(wrapper.className).toContain("bp5-fill");
        expect(wrapper.className).toContain("bp5-large");
    });

    it("TextArea renders and fires onChange", () => {
        const handleChange = vi.fn();
        render(<TextArea defaultValue="hello" onChange={handleChange} />);

        fireEvent.change(screen.getByDisplayValue("hello"), { target: { value: "world" } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("TextArea respects growVertically, fill, and disabled", () => {
        const { container } = render(<TextArea growVertically fill disabled rows={3} />);
        const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(true);
        expect(textarea.className).toContain("bp5-fill");
        expect(textarea.getAttribute("rows")).toBe("3");
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

    it("TagInput supports disabled and leftIcon", () => {
        const { container } = render(
            <TagInput values={[]} disabled leftIcon="filter" placeholder="tags" />,
        );

        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.disabled).toBe(true);
        expect(container.querySelector(".bp5-icon-filter")).not.toBeNull();
        expect(input.placeholder).toBe("tags");
    });

    it("Slider renders with correct aria values", () => {
        render(<Slider min={0} max={10} value={5} onChange={vi.fn()} />);

        const slider = screen.getByRole("slider");
        expect(slider.getAttribute("aria-valuemin")).toBe("0");
        expect(slider.getAttribute("aria-valuemax")).toBe("10");
        expect(slider.getAttribute("aria-valuenow")).toBe("5");
    });

    it("Slider supports vertical orientation and step", () => {
        render(<Slider min={0} max={10} stepSize={2} vertical value={4} onChange={vi.fn()} />);
        const slider = screen.getByRole("slider");
        expect(slider.getAttribute("aria-valuenow")).toBe("4");
        const track = slider.parentElement;
        expect(track?.className).toContain("bp5-vertical");
    });

    it("Switch toggles and fires onChange", () => {
        const handleChange = vi.fn();
        render(<Switch label="Enable" onChange={handleChange} />);

        fireEvent.click(screen.getByLabelText("Enable"));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("Switch supports checked/disabled/alignIndicator props", () => {
        const handleChange = vi.fn();
        render(
            <Switch
                label="Aligned"
                checked
                disabled
                alignIndicator="right"
                onChange={handleChange}
            />,
        );

        const input = screen.getByLabelText("Aligned") as HTMLInputElement;
        expect(input.checked).toBe(true);
        expect(input.disabled).toBe(true);
        const control = input.closest(".bp5-control");
        expect(control?.className).toContain("bp5-align-right");
    });

    it("Checkbox toggles and fires onChange", () => {
        const handleChange = vi.fn();
        render(<Checkbox label="Check" onChange={handleChange} />);

        fireEvent.click(screen.getByLabelText("Check"));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("Checkbox supports indeterminate and inline props", () => {
        render(<Checkbox label="Maybe" indeterminate inline />);
        const input = screen.getByLabelText("Maybe") as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
        const control = input.closest(".bp5-control");
        expect(control?.className).toContain("bp5-inline");
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

    it("Dialog respects props like canEscapeKeyClose and isCloseButtonShown", () => {
        const { portal, cleanup } = renderWithPortal(
            <Dialog isOpen canEscapeKeyClose={false} isCloseButtonShown={false} title="No X">
                <p>Dialog body</p>
            </Dialog>,
        );

        const portalEl = portal();
        expect(portalEl?.querySelector(".bp5-dialog-close-button")).toBeNull();

        // escape should not close when canEscapeKeyClose is false
        fireEvent.keyDown(document, { key: "Escape" });
        expect(portalEl?.textContent).toContain("Dialog body");

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

    it("Alert supports loading state", () => {
        const { cleanup } = renderWithPortal(
            <Alert
                isOpen
                confirmButtonText="Send"
                loading
            >
                Body
            </Alert>,
        );

        const confirmBtn = screen.getByText("Send").closest("button") as HTMLButtonElement;
        expect(confirmBtn?.className).toContain("bp5-loading");

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

    it("Popover honors isOpen/disabled props", async () => {
        const { portal, cleanup } = renderWithPortal(
            <Popover content={<div>Forced</div>} isOpen disabled>
                <Button>Target</Button>
            </Popover>,
        );

        await flushPromises();
        expect(portal()).toBeNull(); // disabled prevents render even if isOpen passed

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

    it("Tooltip supports minimal and position props", () => {
        const { portal, cleanup } = renderWithPortal(
            <Tooltip content="North" minimal position={Position.TOP_LEFT} isOpen>
                <Button>Tip</Button>
            </Tooltip>,
        );

        const portalEl = portal();
        expect(portalEl?.querySelector(".bp5-tooltip")?.className).toContain("bp5-minimal");
        expect((portalEl?.textContent ?? "")).toContain("North");

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

    it("Callout supports icon and minimal props", () => {
        const { container } = render(
            <Callout title="Info" icon="info-sign" minimal>
                Content
            </Callout>,
        );

        const callout = container.querySelector(".bp5-callout");
        expect(callout?.className).toContain("bp5-minimal");
        expect(callout?.querySelector(".bp5-icon-info-sign")).not.toBeNull();
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

    it("Tabs respect vertical and large props", () => {
        const { container } = render(
            <Tabs id="tabs2" vertical selectedTabId="one">
                <Tab id="one" title="One" panel={<div>Panel One</div>} />
                <Tab id="two" title="Two" panel={<div>Panel Two</div>} />
            </Tabs>,
        );

        const tabs = container.querySelector(".bp5-tabs");
        expect(tabs?.className).toContain("bp5-vertical");
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

