import * as React from "react";
import { createPortal } from "react-dom";
import { Intent } from "components/ui/intent";

// Toast state
interface ToastState {
    id: string;
    message: React.ReactNode;
    intent?: Intent;
    timeout?: number;
}

let toasts: ToastState[] = [];
let listeners: Array<(toasts: ToastState[]) => void> = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener([...toasts]));
};

const generateId = () => Math.random().toString(36).slice(2);

export interface ToastProps {
    message: React.ReactNode;
    intent?: Intent;
    timeout?: number;
    icon?: React.ReactNode;
    action?: {
        text: string;
        onClick: () => void;
    };
}

/**
 * Show a toast notification.
 * Returns the toast ID for dismissal.
 */
export const showToast = (props: ToastProps): string => {
    const id = generateId();
    const timeout = props.timeout ?? 5000;

    toasts = [...toasts, { id, message: props.message, intent: props.intent, timeout }];
    notifyListeners();

    if (timeout > 0) {
        setTimeout(() => {
            dismissToast(id);
        }, timeout);
    }

    return id;
};

/**
 * Dismiss a specific toast by ID.
 */
export const dismissToast = (id: string): void => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
};

/**
 * Clear all toasts.
 */
export const clearToasts = (): void => {
    toasts = [];
    notifyListeners();
};

/**
 * Subscribe to toast changes.
 */
export const subscribeToToasts = (listener: (toasts: ToastState[]) => void) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
};

/**
 * Get current toasts (for the host component).
 */
export const getToasts = () => toasts;

// Legacy compatibility exports
export const getAppToaster = () => ({
    show: showToast,
    dismiss: dismissToast,
    clear: clearToasts,
});

/**
 * AppToasterHost - React component that renders toasts.
 * Mount this once at the app root.
 */
export const AppToasterHost: React.FC = () => {
    const [currentToasts, setCurrentToasts] = React.useState<ToastState[]>([]);

    React.useEffect(() => {
        return subscribeToToasts(setCurrentToasts);
    }, []);

    if (currentToasts.length === 0) return null;

    const intentClasses: Record<Intent, string> = {
        [Intent.NONE]: "bg-slate-800 text-white",
        [Intent.PRIMARY]: "bg-blue-600 text-white",
        [Intent.SUCCESS]: "bg-green-600 text-white",
        [Intent.WARNING]: "bg-amber-500 text-white",
        [Intent.DANGER]: "bg-red-600 text-white",
    };

    return createPortal(
        React.createElement(
            "div",
            {
                className: "fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2",
                style: { minWidth: 300, maxWidth: 500 },
            },
            currentToasts.map((toast) =>
                React.createElement(
                    "div",
                    {
                        key: toast.id,
                        className: `flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${intentClasses[toast.intent ?? Intent.NONE]}`,
                        role: "alert",
                    },
                    React.createElement("span", { className: "flex-1 text-sm" }, toast.message),
                    React.createElement(
                        "button",
                        {
                            type: "button",
                            onClick: () => dismissToast(toast.id),
                            className: "flex-shrink-0 rounded p-1 transition-colors hover:bg-white/10",
                            "aria-label": "Dismiss",
                        },
                        "×"
                    )
                )
            )
        ),
        document.body
    );
};
