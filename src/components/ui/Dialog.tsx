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

    const content = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "dialog-title" : undefined}
                tabIndex={-1}
                className={`relative z-10 max-h-[85vh] w-full max-w-lg overflow-auto rounded-lg shadow-xl border bg-white dark:bg-[#0E0601] text-gray-900 dark:text-[#f5ede4] border-gray-200 dark:border-[#101116] ${className}`}
                style={style}
                {...rest}
            >
                {(title || isCloseButtonShown) && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#101116]">
                        <div className="flex items-center gap-2">
                            {icon && (
                                <Icon
                                    icon={icon}
                                    size={18}
                                    className="text-gray-500 dark:text-[#8a7560]"
                                />
                            )}
                            {title && (
                                <h2
                                    id="dialog-title"
                                    className="text-lg font-semibold text-gray-900 dark:text-[#f5ede4]"
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
                                className="rounded p-1 hover:opacity-80 text-gray-500 dark:text-[#8a7560]"
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
