import React from "react";

interface MenuProps {
    children: React.ReactNode;
    className?: string;
}

interface MenuItemProps {
    children: React.ReactNode;
    onSelect?: () => void;
    disabled?: boolean;
    danger?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const Menu: React.FC<MenuProps> = ({ children, className = "" }) => {
    return (
        <div
            className={`min-w-[160px] rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1 z-10 ${className}`}
        >
            {children}
        </div>
    );
};

export const MenuItem: React.FC<MenuItemProps> = ({
    children,
    onSelect,
    disabled = false,
    danger = false,
    icon,
    className = "",
}) => {
    const baseClasses =
        "w-full px-3 py-2 text-sm text-left flex items-center gap-2 rounded-sm transition-colors";
    const stateClasses = disabled
        ? "opacity-60 cursor-not-allowed"
        : danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          : "hover:bg-accent hover:text-accent-foreground";

    return (
        <button
            type="button"
            onClick={!disabled ? onSelect : undefined}
            disabled={disabled}
            aria-disabled={disabled}
            className={`cursor-pointer ${baseClasses} ${stateClasses} ${className}`}
        >
            {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
            <span className="flex-1">{children}</span>
        </button>
    );
};

