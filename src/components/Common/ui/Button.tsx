import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "px-3 py-2 bg-primary text-white border-transparent hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
        "px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus-visible:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700",
    outline:
        "px-3 py-2 border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost:
        "px-3 py-2 border border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
    icon:
        "p-2 border border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-200 rounded-full dark:text-gray-300 dark:hover:bg-gray-800",
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    className = "",
    disabled,
    ...props
}) => {
    const baseClasses =
        "inline-flex items-center gap-2 text-sm font-medium rounded-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
