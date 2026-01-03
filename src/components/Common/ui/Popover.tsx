import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export type PopoverInteractionKind = "click" | "hover" | "click-target-only";

export interface PopoverProps {
    content: React.ReactNode;
    children: React.ReactNode;
    interactionKind?: PopoverInteractionKind;
    position?: "top" | "bottom" | "left" | "right" | "auto";
    minimal?: boolean;
    popoverClassName?: string;
    onClose?: () => void;
}

export const Popover: React.FC<PopoverProps> = ({
    content,
    children,
    interactionKind = "click",
    position = "bottom",
    minimal = false,
    popoverClassName = "",
    onClose,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !isOpen) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverEl = popoverRef.current;
        const popoverWidth = popoverEl?.offsetWidth || 160;
        const popoverHeight = popoverEl?.offsetHeight || 100;
        const gap = 8;
        
        let top = 0;
        let left = 0;

        switch (position) {
            case "top":
                top = triggerRect.top - popoverHeight - gap;
                left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
                break;
            case "bottom":
                top = triggerRect.bottom + gap;
                left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2;
                break;
            case "left":
                top = triggerRect.top + triggerRect.height / 2 - popoverHeight / 2;
                left = triggerRect.left - popoverWidth - gap;
                break;
            case "right":
                top = triggerRect.top + triggerRect.height / 2 - popoverHeight / 2;
                left = triggerRect.right + gap;
                break;
            case "auto":
            default:
                top = triggerRect.bottom + gap;
                left = triggerRect.left;
                break;
        }

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 8) {
            left = 8;
        } else if (left + popoverWidth > viewportWidth - 8) {
            left = viewportWidth - popoverWidth - 8;
        }
        
        if (top < 8) {
            top = triggerRect.bottom + gap;
        } else if (top + popoverHeight > viewportHeight - 8) {
            top = triggerRect.top - popoverHeight - gap;
        }

        setPopoverPosition({ top, left });
    }, [isOpen, position]);

    useEffect(() => {
        if (!isOpen) return;
        
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen || interactionKind !== "click") return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                popoverRef.current &&
                !popoverRef.current.contains(target)
            ) {
                setIsOpen(false);
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, interactionKind, onClose]);

    const handleToggle = () => {
        if (interactionKind === "click" || interactionKind === "click-target-only") {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (interactionKind === "hover") {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (interactionKind === "hover") {
            setIsOpen(false);
        }
    };

    const popoverContent = isOpen ? (
        <div
            ref={popoverRef}
            className={`fixed z-[9999] ${
                minimal ? "p-0" : "p-3"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 ${popoverClassName}`}
            style={{
                top: popoverPosition.top,
                left: popoverPosition.left,
            }}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {content}
        </div>
    ) : null;

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                onClick={
                    interactionKind === "click" || interactionKind === "click-target-only"
                        ? handleToggle
                        : undefined
                }
            >
                {children}
            </div>
            {isOpen && createPortal(popoverContent, document.body)}
        </div>
    );
};
