/**
 * Tooltip Component
 *
 * A tooltip component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";
import { createPortal } from "react-dom";

export type TooltipPosition =
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

export interface TooltipProps {
    /** The content to display in the tooltip */
    content: React.ReactNode;
    /** The trigger element */
    children: React.ReactElement;
    /** Position of the tooltip relative to target */
    position?: TooltipPosition;
    /** Whether to use minimal styling */
    minimal?: boolean;
    /** Whether the tooltip is disabled */
    disabled?: boolean;
    /** Whether the tooltip is open (controlled) */
    isOpen?: boolean;
    /** Additional class name */
    className?: string;
    /** Delay before showing tooltip (ms) */
    hoverOpenDelay?: number;
    /** Delay before hiding tooltip (ms) */
    hoverCloseDelay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = "top",
    minimal = false,
    disabled = false,
    isOpen: controlledIsOpen,
    className = "",
    hoverOpenDelay = 100,
    hoverCloseDelay = 0,
}) => {
    const [internalIsOpen, setInternalIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
    const openTimeoutRef = React.useRef<NodeJS.Timeout>();
    const closeTimeoutRef = React.useRef<NodeJS.Timeout>();

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

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

            setTooltipPosition({ top, left });
        }
    }, [isOpen, position]);

    const handleMouseEnter = () => {
        if (disabled || controlledIsOpen !== undefined) return;
        clearTimeout(closeTimeoutRef.current);
        openTimeoutRef.current = setTimeout(() => {
            setInternalIsOpen(true);
        }, hoverOpenDelay);
    };

    const handleMouseLeave = () => {
        if (disabled || controlledIsOpen !== undefined) return;
        clearTimeout(openTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(() => {
            setInternalIsOpen(false);
        }, hoverCloseDelay);
    };

    React.useEffect(() => {
        return () => {
            clearTimeout(openTimeoutRef.current);
            clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    const triggerElement = React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleMouseEnter,
        onBlur: handleMouseLeave,
    });

    const tooltipContent = isOpen && !disabled ? (
        createPortal(
            <div
                role="tooltip"
                className={`fixed z-50 rounded px-2 py-1 text-sm ${minimal ? "bg-gray-900 text-white" : "bg-gray-900 text-white shadow-lg"} ${className}`}
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    transform: position.startsWith("bottom") ? "translateX(-50%)" : position.startsWith("top") ? "translateX(-50%) translateY(-100%)" : position.startsWith("left") ? "translateX(-100%) translateY(-50%)" : "translateY(-50%)",
                }}
            >
                {content}
            </div>,
            document.body
        )
    ) : null;

    return (
        <div ref={triggerRef} className="inline-block">
            {triggerElement}
            {tooltipContent}
        </div>
    );
};

export default Tooltip;
