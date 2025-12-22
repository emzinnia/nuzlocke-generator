/**
 * Popover Component
 *
 * A popover component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";
import { createPortal } from "react-dom";

export type PopoverPosition =
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";

export type PopoverInteractionKind = "click" | "hover";

export interface PopoverProps {
    /** The content to display in the popover */
    content: React.ReactNode;
    /** The trigger element */
    children: React.ReactElement;
    /** Position of the popover relative to target */
    position?: PopoverPosition;
    /** How the popover opens */
    interactionKind?: PopoverInteractionKind;
    /** Whether the popover is open (controlled) */
    isOpen?: boolean;
    /** Callback when open state changes */
    onInteraction?: (nextOpenState: boolean) => void;
    /** Whether to use minimal styling */
    minimal?: boolean;
    /** Whether the popover is disabled */
    disabled?: boolean;
    /** Additional class name for the popover */
    popoverClassName?: string;
    /** Additional class name for the wrapper */
    className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
    content,
    children,
    position = "bottom",
    interactionKind = "click",
    isOpen: controlledIsOpen,
    onInteraction,
    minimal = false,
    disabled = false,
    popoverClassName = "",
    className = "",
}) => {
    const [internalIsOpen, setInternalIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);
    const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const setIsOpen = (newState: boolean) => {
        if (onInteraction) {
            onInteraction(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    // Calculate position
    React.useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = 0;
            let left = 0;

            switch (position) {
                case "bottom":
                case "bottom-start":
                case "bottom-end":
                    top = rect.bottom + 8;
                    left = position === "bottom-end" ? rect.right : position === "bottom-start" ? rect.left : rect.left + rect.width / 2;
                    break;
                case "top":
                case "top-start":
                case "top-end":
                    top = rect.top - 8;
                    left = position === "top-end" ? rect.right : position === "top-start" ? rect.left : rect.left + rect.width / 2;
                    break;
                case "left":
                case "left-start":
                case "left-end":
                    top = rect.top + rect.height / 2;
                    left = rect.left - 8;
                    break;
                case "right":
                case "right-start":
                case "right-end":
                    top = rect.top + rect.height / 2;
                    left = rect.right + 8;
                    break;
            }

            setPopoverPosition({ top, left });
        }
    }, [isOpen, position]);

    // Handle click outside
    React.useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node) &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleTriggerClick = () => {
        if (!disabled && interactionKind === "click") {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (!disabled && interactionKind === "hover") {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (!disabled && interactionKind === "hover") {
            setIsOpen(false);
        }
    };

    const triggerElement = React.cloneElement(children, {
        onClick: handleTriggerClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    });

    const popoverContent = isOpen && !disabled ? (
        createPortal(
            <div
                ref={popoverRef}
                className={`fixed z-50 rounded-md bg-white shadow-lg dark:bg-gray-800 ${minimal ? "" : "border border-gray-200 dark:border-gray-700 p-3"} ${popoverClassName}`}
                style={{
                    top: popoverPosition.top,
                    left: popoverPosition.left,
                    transform: position.startsWith("bottom") ? "translateX(-50%)" : position.startsWith("top") ? "translateX(-50%) translateY(-100%)" : undefined,
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {content}
            </div>,
            document.body
        )
    ) : null;

    return (
        <div ref={triggerRef} className={`inline-block ${className}`}>
            {triggerElement}
            {popoverContent}
        </div>
    );
};

export default Popover;
