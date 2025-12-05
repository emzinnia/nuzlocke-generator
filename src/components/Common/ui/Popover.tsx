import React, { useState, useRef, useEffect } from "react";

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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                onClose?.();
            }
        };

        if (isOpen && interactionKind === "click") {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
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

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
        auto: "top-full left-0 mt-2",
    };

    return (
        <div
            ref={containerRef}
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
            {isOpen && (
                <div
                    className={`absolute z-50 ${
                        minimal ? "p-0" : "p-3"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 ${
                        positionClasses[position]
                    } ${popoverClassName}`}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

