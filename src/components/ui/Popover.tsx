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

const EDGE_PADDING = 8; // Minimum distance from screen edge

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
    const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({
        top: 0,
        left: 0,
        visibility: "hidden",
    });

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const setIsOpen = (newState: boolean) => {
        if (onInteraction) {
            onInteraction(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    // Calculate position and keep within viewport
    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current || !popoverRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;

        // Calculate initial position based on preferred position
        switch (position) {
            case "bottom":
                top = triggerRect.bottom + 8;
                left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
                break;
            case "bottom-start":
                top = triggerRect.bottom + 8;
                left = triggerRect.left;
                break;
            case "bottom-end":
                top = triggerRect.bottom + 8;
                left = triggerRect.right - popoverRect.width;
                break;
            case "top":
                top = triggerRect.top - popoverRect.height - 8;
                left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
                break;
            case "top-start":
                top = triggerRect.top - popoverRect.height - 8;
                left = triggerRect.left;
                break;
            case "top-end":
                top = triggerRect.top - popoverRect.height - 8;
                left = triggerRect.right - popoverRect.width;
                break;
            case "left":
                top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
                left = triggerRect.left - popoverRect.width - 8;
                break;
            case "left-start":
                top = triggerRect.top;
                left = triggerRect.left - popoverRect.width - 8;
                break;
            case "left-end":
                top = triggerRect.bottom - popoverRect.height;
                left = triggerRect.left - popoverRect.width - 8;
                break;
            case "right":
                top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
                left = triggerRect.right + 8;
                break;
            case "right-start":
                top = triggerRect.top;
                left = triggerRect.right + 8;
                break;
            case "right-end":
                top = triggerRect.bottom - popoverRect.height;
                left = triggerRect.right + 8;
                break;
        }

        // Clamp to viewport bounds
        // Horizontal clamping
        if (left < EDGE_PADDING) {
            left = EDGE_PADDING;
        } else if (left + popoverRect.width > viewportWidth - EDGE_PADDING) {
            left = viewportWidth - popoverRect.width - EDGE_PADDING;
        }

        // Vertical clamping
        if (top < EDGE_PADDING) {
            top = EDGE_PADDING;
        } else if (top + popoverRect.height > viewportHeight - EDGE_PADDING) {
            top = viewportHeight - popoverRect.height - EDGE_PADDING;
        }

        setPopoverStyle({
            top,
            left,
            visibility: "visible",
        });
    }, [position]);

    // Update position when open or position changes
    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        // Use requestAnimationFrame to ensure the popover is rendered before measuring
        const rafId = requestAnimationFrame(() => {
            updatePosition();
        });
        return () => cancelAnimationFrame(rafId);
    }, [isOpen, updatePosition]);

    // Handle window resize/scroll
    React.useEffect(() => {
        if (!isOpen) return;

        const handleUpdate = () => updatePosition();

        window.addEventListener("resize", handleUpdate);
        window.addEventListener("scroll", handleUpdate, true);

        return () => {
            window.removeEventListener("resize", handleUpdate);
            window.removeEventListener("scroll", handleUpdate, true);
        };
    }, [isOpen, updatePosition]);

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

    const popoverContent =
        isOpen && !disabled
            ? createPortal(
                  <div
                      ref={popoverRef}
                      className={`fixed z-[1060] rounded-lg shadow-xl ${
                          minimal ? "p-0" : "border p-3"
                      } ${popoverClassName}`}
                      style={{
                          ...popoverStyle,
                          backgroundColor: "var(--color-bg-primary)",
                          borderColor: "var(--color-border-default)",
                          color: "var(--color-text-primary)",
                      }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                  >
                      {content}
                  </div>,
                  document.body,
              )
            : null;

    return (
        <div ref={triggerRef} className={`inline-block ${className}`}>
            {triggerElement}
            {popoverContent}
        </div>
    );
};

export default Popover;
