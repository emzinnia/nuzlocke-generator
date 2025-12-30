import * as React from "react";
import { cx } from "emotion";
import { useDebounceCallback } from "@react-hook/debounce";
import { css } from "emotion";

export interface AutocompleteProps {
    items: string[];
    placeholder?: string;
    name?: string;
    label?: string;
    disabled?: boolean;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    className?: string;
    rightElement?: React.ReactNode;
    /* @NOTE: this value should always be in conjunction with disabled
       it is used to obscure unimportant data, like Species when a Pokemon is an egg */
    makeInvisibleText?: boolean;
}

const renderItems = (
    visibleItems: string[],
    selectItem: (e: React.SyntheticEvent) => (value: string) => void,
    _innerValue: string,
    selectedValue: string,
) =>
    visibleItems.map((v, i) => {
        return (
            <li
                key={i}
                onClick={(e) => selectItem(e)(v)}
                className={v === selectedValue ? "autocomplete-selected" : ""}
            >
                {v}
            </li>
        );
    });

const filter = (items, str) =>
    items?.filter((i) => i?.toLowerCase().startsWith(str.toLowerCase()));

const invisibleText = css`
    color: transparent !important;
`;

export function Autocomplete({
    label,
    name,
    placeholder,
    onChange,
    className,
    disabled,
    makeInvisibleText,
    items,
    // onInput,
    value,
    rightElement,
}: AutocompleteProps) {
    const [innerValue, setValue] = React.useState("");
    const [selectedValue, setSelectedValue] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    // Initialize from props so keyboard navigation works immediately (before the first effect runs).
    const [visibleItems, setVisibleItems] = React.useState<string[]>(() => filter(items, value) ?? []);
    const listRef = React.useRef<HTMLUListElement>(null);
    const closeTimeoutRef = React.useRef<number | undefined>(undefined);

    const delayedValue = useDebounceCallback((e) => onChange(e), 300);

    React.useEffect(() => {
        setValue(value);
        setVisibleItems(filter(items, value));
        // setIsOpen(false);
    }, [value, items]);

    const changeEvent =
        (innerEvent: boolean = true) =>
        (e) => {
            if (innerEvent) {
                e.persist();
            }
            setValue(e.target.value);
            setVisibleItems(filter(items, e.target.value));
            delayedValue({ target: { value: e.target.value } });
        };

    const handleMovement = (e) => {
        e?.preventDefault?.();
        if (!visibleItems?.length) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keyCode = (e as any)?.which ?? (e as any)?.keyCode ?? (e as any)?.nativeEvent?.keyCode;
        const isArrowUp = e?.key === "ArrowUp" || keyCode === 38;
        const direction = isArrowUp ? -1 : 1;

        setSelectedValue((prev) => {
            const currentIndex = visibleItems.indexOf(prev);
            const hasSelection = currentIndex !== -1;
            const proposedIndex = hasSelection
                ? currentIndex + direction
                : direction > 0
                  ? 0
                  : visibleItems.length - 1;
            const nextIndex = Math.min(
                Math.max(proposedIndex, 0),
                visibleItems.length - 1,
            );

            return visibleItems[nextIndex] ?? prev;
        });
        setIsOpen(true);
    };
    const openList = (_e) => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = undefined;
        }
        setIsOpen(true);
        // Keep list in sync when reopening without changing the input value.
        setVisibleItems(filter(items, innerValue) ?? []);
    };
    const closeList = (e) => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = window.setTimeout(() => {
            setIsOpen(false);
            // Keep visible items aligned to the last typed value; reopening will re-filter anyway.
            setVisibleItems(filter(items, e.target.value) ?? []);
            setSelectedValue("");
            closeTimeoutRef.current = undefined;
        }, 250);
        setValue(e.target.value);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.persist();
        setVisibleItems(filter(items, e.currentTarget.value));

        // Prefer modern `key` but keep keyCode/which compatibility (tests + older browsers).
        const keyCode =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e as any).which ?? (e as any).keyCode ?? (e as any).nativeEvent?.keyCode;
        const isEnter = e.key === "Enter" || keyCode === 13;
        const isBackspace = e.key === "Backspace" || keyCode === 8;
        const isEscape = e.key === "Escape" || keyCode === 27;
        const isTab = e.key === "Tab" || keyCode === 9;
        const isArrowUp = e.key === "ArrowUp" || keyCode === 38;
        const isArrowDown = e.key === "ArrowDown" || keyCode === 40;

        switch (true) {
            case isEnter:
                e.preventDefault();
                if (selectedValue) {
                    setValue(selectedValue);
                }
                closeList(e);
                changeEvent(false)({
                    ...e,
                    target: {
                        value:
                            selectedValue !== "" ? selectedValue : innerValue,
                    },
                });
                break;
            case isBackspace:
                break;
            case isEscape:
            case isTab:
                closeList(e);
                break;
            case isArrowUp:
            case isArrowDown:
                handleMovement(e);
                break;
            default:
                setSelectedValue("");
                break;
        }
    };
    const selectItem = (e) => (value) => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = undefined;
        }
        setIsOpen(false);
        setSelectedValue("");
        changeEvent(false)({ ...e, target: { value } });
    };

    React.useEffect(() => {
        if (!selectedValue || !listRef.current) {
            return;
        }

        const selectedIndex = visibleItems.indexOf(selectedValue);
        if (selectedIndex < 0) {
            return;
        }

        const selectedNode = listRef.current.children[
            selectedIndex
        ] as HTMLElement | undefined;

        selectedNode?.scrollIntoView({ block: "nearest" });
    }, [selectedValue, visibleItems]);

    return (
        <div className={cx("current-pokemon-input-wrapper", "autocomplete")}>
            <label>{label}</label>
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <input
                    autoComplete="off"
                    className={cx(className, makeInvisibleText && invisibleText)}
                    onKeyDown={handleKeyDown}
                    onFocus={openList}
                    onClick={openList}
                    onBlur={closeList}
                    placeholder={placeholder}
                    name={name}
                    type="text"
                    onChange={changeEvent()}
                    value={innerValue}
                    disabled={disabled}
                    data-testid="autocomplete"
                    style={{ flex: 1, minWidth: 0 }}
                />
                {rightElement ? (
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {rightElement}
                    </span>
                ) : null}
            </div>
            {isOpen ? (
                <ul
                    className="autocomplete-items has-nice-scrollbars"
                    ref={listRef}
                >
                    {renderItems(
                        visibleItems,
                        selectItem,
                        innerValue,
                        selectedValue,
                    )}
                </ul>
            ) : null}
        </div>
    );
}
