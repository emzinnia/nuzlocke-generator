import React, { useEffect } from "react";
import { Button } from "./Button";

interface AlertProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    confirmButtonText?: string;
    cancelButtonText?: string;
    intent?: "danger" | "primary";
    children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
    isOpen,
    onCancel,
    onConfirm,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    intent = "primary",
    children,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onCancel();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const confirmButtonClasses =
        intent === "danger"
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onCancel}
            />
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="text-gray-900 dark:text-gray-100">
                    {children}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onCancel}>
                        {cancelButtonText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm text-white ${confirmButtonClasses}`}
                    >
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

