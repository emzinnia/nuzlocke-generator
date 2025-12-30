import * as React from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Intent } from "./intent";

export interface ToastProps {
    /** Toast message */
    message: React.ReactNode;
    /** Intent for styling */
    intent?: Intent;
    /** Icon (auto-determined by intent if not provided) */
    icon?: React.ReactNode;
    /** Action element */
    action?: {
        text: string;
        onClick: () => void;
    };
    /** Timeout in ms (0 for no auto-dismiss) */
    timeout?: number;
    /** Callback when toast is dismissed */
    onDismiss?: () => void;
    /** Unique id */
    id?: string;
}

/**
 * Individual Toast component.
 */
export const Toast: React.FC<ToastProps & { onClose: () => void }> = ({
    message,
    intent = Intent.NONE,
    icon,
    action,
    onClose,
}) => {
    const defaultIcons: Record<Intent, React.ReactNode> = {
        [Intent.NONE]: <Info size={18} />,
        [Intent.PRIMARY]: <Info size={18} />,
        [Intent.SUCCESS]: <CheckCircle size={18} />,
        [Intent.WARNING]: <AlertTriangle size={18} />,
        [Intent.DANGER]: <AlertCircle size={18} />,
    };

    const bgClasses = {
        [Intent.NONE]: "bg-slate-800 text-white",
        [Intent.PRIMARY]: "bg-primary-600 text-white",
        [Intent.SUCCESS]: "bg-success-600 text-white",
        [Intent.WARNING]: "bg-warning-500 text-white",
        [Intent.DANGER]: "bg-danger-600 text-white",
    };

    const resolvedIcon = icon ?? defaultIcons[intent];

    return (
        <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${bgClasses[intent]} animate-in slide-in-from-top-2 fade-in duration-200`}
            role="alert"
        >
            {resolvedIcon && <span className="flex-shrink-0">{resolvedIcon}</span>}
            <span className="flex-1 text-sm">{message}</span>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="font-medium underline hover:no-underline"
                >
                    {action.text}
                </button>
            )}
            <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded p-1 transition-colors hover:bg-white/10"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// Toast context for global toast management
interface ToastContextValue {
    show: (props: ToastProps) => string;
    dismiss: (id: string) => void;
    clear: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast functions.
 */
export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a Toaster provider");
    }
    return context;
};

interface ToastState extends ToastProps {
    id: string;
}

export interface ToasterProps {
    /** Position of toasts */
    position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right";
    /** Maximum number of toasts to show */
    maxToasts?: number;
    /** Children (app content) */
    children?: React.ReactNode;
}

/**
 * Toaster provider and container.
 */
export const Toaster: React.FC<ToasterProps> = ({
    position = "top",
    maxToasts = 5,
    children,
}) => {
    const [toasts, setToasts] = React.useState<ToastState[]>([]);
    const timeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

    const dismiss = React.useCallback((id: string) => {
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = React.useCallback(
        (props: ToastProps): string => {
            const id = props.id ?? Math.random().toString(36).slice(2);
            const timeout = props.timeout ?? 5000;

            setToasts((prev) => {
                const newToasts = [...prev, { ...props, id }];
                return newToasts.slice(-maxToasts);
            });

            if (timeout > 0) {
                const timeoutId = setTimeout(() => dismiss(id), timeout);
                timeoutsRef.current.set(id, timeoutId);
            }

            return id;
        },
        [maxToasts, dismiss],
    );

    const clear = React.useCallback(() => {
        timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
        timeoutsRef.current.clear();
        setToasts([]);
    }, []);

    const positionClasses = {
        top: "top-4 left-1/2 -translate-x-1/2",
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        bottom: "bottom-4 left-1/2 -translate-x-1/2",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
    };

    const contextValue = React.useMemo(() => ({ show, dismiss, clear }), [show, dismiss, clear]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {typeof document !== "undefined" &&
                createPortal(
                    <div
                        className={`fixed z-toast flex flex-col gap-2 ${positionClasses[position]}`}
                        style={{ minWidth: 300, maxWidth: 500 }}
                    >
                        {toasts.map((toast) => (
                            <Toast key={toast.id} {...toast} onClose={() => dismiss(toast.id)} />
                        ))}
                    </div>,
                    document.body,
                )}
        </ToastContext.Provider>
    );
};

export default Toast;

