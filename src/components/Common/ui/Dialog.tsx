import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface DialogProps {
    isOpen: boolean;
    onClose: (e?: React.SyntheticEvent) => void;
    title?: string;
    icon?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    className = "",
    children,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div
                ref={dialogRef}
                className={`relative z-10 bg-card text-card-foreground rounded-lg shadow-xl border border-border max-w-lg w-full mx-4 max-h-[85vh] flex flex-col ${className}`}
            >
                {title && (
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            {icon && (
                                <span className="text-muted-foreground">
                                    {icon}
                                </span>
                            )}
                            <h2 className="text-lg font-semibold">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={18} />
                    </button>
                )}
                {children}
            </div>
        </div>
    );
};

export interface DialogBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogBody: React.FC<DialogBodyProps> = ({
    children,
    className = "",
}) => {
    return (
        <div className={`px-5 py-4 overflow-y-auto flex-1 ${className}`}>
            {children}
        </div>
    );
};

export interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
    children,
    className = "",
}) => {
    return (
        <div className={`px-5 py-4 border-t border-border flex justify-end gap-3 ${className}`}>
            {children}
        </div>
    );
};

