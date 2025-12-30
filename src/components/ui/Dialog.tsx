/**
 * Dialog Component
 *
 * A modal dialog component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Callback when the dialog should close */
    onClose: () => void;
    /** Dialog title */
    title?: React.ReactNode;
    /** Icon to show in the header */
    icon?: string;
    /** Whether pressing Escape closes the dialog */
    canEscapeKeyClose?: boolean;
    /** Whether clicking outside closes the dialog */
    canOutsideClickClose?: boolean;
    /** Whether to show the close button */
    isCloseButtonShown?: boolean;
    /** Additional class name */
    className?: string;
    /** Dialog content */
    children?: React.ReactNode;
    /** Custom styles */
    style?: React.CSSProperties;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    canEscapeKeyClose = true,
    canOutsideClickClose = true,
    isCloseButtonShown = true,
    className = "",
    children,
    style,
    ...rest
}) => {
    const dialogRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!isOpen || !canEscapeKeyClose) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, canEscapeKeyClose, onClose]);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (canOutsideClickClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    // Detect if dark mode is active by checking for the class on the dialog or html element
    const isDark = className.includes("dark");

    // Dark mode colors (matching tokens.css)
    const darkColors = {
        bgPrimary: "#0E0601",
        bgSecondary: "#090806",
        textPrimary: "#f5ede4",
        textTertiary: "#8a7560",
        borderDefault: "#101116",
    };

    const lightColors = {
        bgPrimary: "#ffffff",
        textPrimary: "#1e293b",
        textTertiary: "#94a3b8",
        borderDefault: "#e2e8f0",
    };

    const colors = isDark ? darkColors : lightColors;

    const content = (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? "dark" : ""}`}
            onClick={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "dialog-title" : undefined}
                tabIndex={-1}
                className={`relative z-10 max-h-[85vh] w-full max-w-lg overflow-auto rounded-lg shadow-xl border ${className}`}
                style={{
                    backgroundColor: colors.bgPrimary,
                    borderColor: colors.borderDefault,
                    color: colors.textPrimary,
                    ...style,
                }}
                {...rest}
            >
                {(title || isCloseButtonShown) && (
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{
                            borderBottom: `1px solid ${colors.borderDefault}`,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            {icon && (
                                <Icon
                                    icon={icon}
                                    size={18}
                                    style={{ color: colors.textTertiary }}
                                />
                            )}
                            {title && (
                                <h2
                                    id="dialog-title"
                                    className="text-lg font-semibold"
                                    style={{ color: colors.textPrimary }}
                                >
                                    {title}
                                </h2>
                            )}
                        </div>
                        {isCloseButtonShown && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="rounded p-1 hover:opacity-80"
                                style={{ color: colors.textTertiary }}
                            >
                                <Icon icon="cross" size={20} />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

/**
 * Dialog body wrapper (for Blueprint compatibility)
 */
export const DialogBody: React.FC<{ children?: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => <div className={`p-4 ${className}`}>{children}</div>;

/**
 * Dialog footer wrapper (for Blueprint compatibility)
 */
export const DialogFooter: React.FC<{ children?: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => (
    <div
        className={`flex items-center justify-end gap-2 px-4 py-3 ${className}`}
        style={{ borderTop: "1px solid var(--color-border-default)" }}
    >
        {children}
    </div>
);

export default Dialog;
