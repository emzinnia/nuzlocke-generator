import * as React from "react";
import { Button } from "./Button";
import { Dialog, type DialogProps } from "./Dialog";
import { Intent } from "./intent";

export interface AlertProps
    extends Omit<
        DialogProps,
        | "onClose"
        | "title"
        | "icon"
        | "children"
        | "canEscapeKeyClose"
        | "canOutsideClickClose"
        | "isCloseButtonShown"
    > {
    /** Whether the alert is open */
    isOpen: boolean;
    /** Called when the user cancels (or dismisses via escape/outside click) */
    onCancel?: () => void;
    /** Called when the alert should close (legacy compatibility) */
    onClose?: () => void;
    /** Called when the user confirms */
    onConfirm?: () => void;
    /** Text for the cancel button */
    cancelButtonText?: string;
    /** Text for the confirm button */
    confirmButtonText?: string;
    /** Intent for the confirm button */
    intent?: Intent | "none" | "primary" | "success" | "warning" | "danger";
    /** Icon name (Blueprint compatibility) */
    icon?: string;
    /** Optional title/header */
    title?: React.ReactNode;
    /** Alert body */
    children?: React.ReactNode;
    /** Whether pressing Escape cancels */
    canEscapeKeyCancel?: boolean;
    /** Whether clicking outside cancels */
    canOutsideClickCancel?: boolean;
    /** Additional class name */
    className?: string;
    /** Custom styles */
    style?: React.CSSProperties;
}

const normalizeIntent = (
    intent: AlertProps["intent"] | undefined,
): Intent => {
    if (!intent) return Intent.NONE;
    if (typeof intent === "string") {
        switch (intent) {
            case "primary":
                return Intent.PRIMARY;
            case "success":
                return Intent.SUCCESS;
            case "warning":
                return Intent.WARNING;
            case "danger":
                return Intent.DANGER;
            case "none":
            default:
                return Intent.NONE;
        }
    }
    return intent;
};

/**
 * Alert component (Blueprint-compatible).
 * Implemented as a Dialog with a required footer that renders Confirm + Cancel buttons.
 */
export const Alert: React.FC<AlertProps> = ({
    isOpen,
    onCancel,
    onClose,
    onConfirm,
    cancelButtonText = "Cancel",
    confirmButtonText = "OK",
    intent = Intent.NONE,
    icon,
    title,
    canEscapeKeyCancel = true,
    canOutsideClickCancel = true,
    className = "",
    style,
    children,
    ...rest
}) => {
    const dismiss = React.useCallback(() => {
        // Dismiss should behave like "cancel" when available, otherwise fall back to onClose.
        (onCancel ?? onClose)?.();
    }, [onCancel, onClose]);

    const handleConfirm = React.useCallback(() => {
        // Do NOT auto-dismiss here: many callers close the alert themselves inside onConfirm.
        // Auto-dismiss can accidentally re-open the alert when the "close" handler is a toggle.
        onConfirm?.();
    }, [onConfirm]);

    const confirmIntent = normalizeIntent(intent);

    return (
        <Dialog
            isOpen={isOpen}
            onClose={dismiss}
            title={title}
            icon={icon}
            canEscapeKeyClose={canEscapeKeyCancel}
            canOutsideClickClose={canOutsideClickCancel}
            isCloseButtonShown={false}
            className={className}
            style={style}
            {...rest}
        >
            {children}

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button outlined onClick={dismiss}>
                    {cancelButtonText}
                </Button>
                <Button intent={confirmIntent} onClick={handleConfirm}>
                    {confirmButtonText}
                </Button>
            </div>
        </Dialog>
    );
};

export default Alert;


