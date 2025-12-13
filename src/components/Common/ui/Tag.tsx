import React from "react";
import { X } from "lucide-react";

type TagIntent = "default" | "primary" | "success" | "warning" | "danger";

interface TagProps {
    children: React.ReactNode;
    intent?: TagIntent;
    onRemove?: () => void;
    className?: string;
    minimal?: boolean;
    style?: React.CSSProperties;
}

const intentStyles: Record<TagIntent, string> = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const minimalStyles: Record<TagIntent, string> = {
    default: "text-gray-600 dark:text-gray-400",
    primary: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    danger: "text-red-600 dark:text-red-400",
};

export const Tag: React.FC<TagProps> = ({
    children,
    intent = "default",
    onRemove,
    className = "",
    minimal = false,
    style,
}) => {
    const baseStyles = minimal ? minimalStyles[intent] : intentStyles[intent];

    return (
        <span
            style={style}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md ${
                minimal ? "" : baseStyles
            } ${minimal ? baseStyles : ""} ${className}`}
        >
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                    <X size={12} />
                </button>
            )}
        </span>
    );
};

