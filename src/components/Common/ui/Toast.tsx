import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastIntent = "success" | "danger" | "warning" | "info";

interface Toast {
    id: string;
    message: string;
    intent?: ToastIntent;
    duration?: number;
}

interface ToastContextValue {
    show: (message: string, intent?: ToastIntent, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

const intentStyles: Record<ToastIntent, { bg: string; icon: React.ReactNode }> = {
    success: {
        bg: "bg-green-600",
        icon: <CheckCircle size={18} />,
    },
    danger: {
        bg: "bg-red-600",
        icon: <AlertCircle size={18} />,
    },
    warning: {
        bg: "bg-yellow-500",
        icon: <AlertTriangle size={18} />,
    },
    info: {
        bg: "bg-blue-500",
        icon: <Info size={18} />,
    },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
    toast,
    onDismiss,
}) => {
    const { bg, icon } = intentStyles[toast.intent || "info"];

    useEffect(() => {
        if (toast.duration !== 0) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, toast.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${bg} animate-in slide-in-from-right-full duration-300`}
        >
            {icon}
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((message: string, intent: ToastIntent = "info", duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, message, intent, duration }]);
    }, []);

    const success = useCallback((message: string, duration?: number) => show(message, "success", duration), [show]);
    const error = useCallback((message: string, duration?: number) => show(message, "danger", duration), [show]);
    const warning = useCallback((message: string, duration?: number) => show(message, "warning", duration), [show]);
    const info = useCallback((message: string, duration?: number) => show(message, "info", duration), [show]);

    return (
        <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

let globalToastFn: ToastContextValue | null = null;

export const setGlobalToast = (toast: ToastContextValue) => {
    globalToastFn = toast;
};

export const toast = {
    show: (message: string, intent?: ToastIntent, duration?: number) => globalToastFn?.show(message, intent, duration),
    success: (message: string, duration?: number) => globalToastFn?.success(message, duration),
    error: (message: string, duration?: number) => globalToastFn?.error(message, duration),
    warning: (message: string, duration?: number) => globalToastFn?.warning(message, duration),
    info: (message: string, duration?: number) => globalToastFn?.info(message, duration),
};

