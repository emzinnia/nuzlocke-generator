import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type DrawerPosition = "left" | "right";
type DrawerSize = "small" | "standard" | "large";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: React.ReactNode;
    position?: DrawerPosition;
    size?: DrawerSize;
    className?: string;
    children: React.ReactNode;
}

const sizeClasses: Record<DrawerSize, string> = {
    small: "w-64",
    standard: "w-96",
    large: "w-[32rem]",
};

const positionClasses: Record<DrawerPosition, { container: string; panel: string; translate: string }> = {
    left: {
        container: "left-0",
        panel: "left-0",
        translate: "-translate-x-full",
    },
    right: {
        container: "right-0",
        panel: "right-0",
        translate: "translate-x-full",
    },
};

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    position = "right",
    size = "standard",
    className = "",
    children,
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const posStyles = positionClasses[position];

    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity duration-300 ${
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div
                ref={drawerRef}
                className={`absolute top-0 ${posStyles.panel} h-full ${sizeClasses[size]} max-w-[90vw] bg-card text-card-foreground shadow-xl border-l border-border flex flex-col transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : posStyles.translate
                } ${className}`}
            >
                {title && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                        <div className="flex items-center gap-2">
                            {icon && (
                                <span className="text-muted-foreground">
                                    {icon}
                                </span>
                            )}
                            <h2 className="text-lg font-semibold">{title}</h2>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className="p-1 h-auto w-auto rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                )}
                {!title && (
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="absolute top-3 right-3 p-1 h-auto w-auto rounded text-muted-foreground hover:text-foreground hover:bg-muted z-10"
                    >
                        <X size={18} />
                    </Button>
                )}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const DrawerSize = {
    SMALL: "small" as DrawerSize,
    STANDARD: "standard" as DrawerSize,
    LARGE: "large" as DrawerSize,
};

