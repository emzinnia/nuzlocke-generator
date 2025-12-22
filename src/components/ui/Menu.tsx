/**
 * Menu Component
 *
 * A menu component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";
import { Icon } from "./Icon";
import type { Intent } from "./intent";

export interface MenuProps {
    /** Menu items */
    children?: React.ReactNode;
    /** Additional class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
}

export const Menu: React.FC<MenuProps> = ({ children, className = "", style }) => {
    return (
        <div
            role="menu"
            style={style}
            className={`min-w-[180px] rounded-md bg-white py-1 shadow-lg dark:bg-gray-800 ${className}`}
        >
            {children}
        </div>
    );
};

export interface MenuItemProps {
    /** Item text */
    text?: React.ReactNode;
    /** Icon name */
    icon?: string;
    /** Click handler */
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    /** Whether the item is disabled */
    disabled?: boolean;
    /** Whether the item is active/selected */
    active?: boolean;
    /** Intent for styling */
    intent?: Intent | "none" | "primary" | "success" | "warning" | "danger";
    /** Additional class name */
    className?: string;
    /** Children (alternative to text) */
    children?: React.ReactNode;
    /** Right element */
    labelElement?: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
    text,
    icon,
    onClick,
    disabled = false,
    active = false,
    intent,
    className = "",
    children,
    labelElement,
}) => {
    const intentClasses = {
        primary: "text-blue-600 dark:text-blue-400",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        danger: "text-red-600 dark:text-red-400",
        none: "",
    };

    const intentClass = intent && intent !== "none" ? intentClasses[intent as keyof typeof intentClasses] || "" : "";

    return (
        <div
            role="menuitem"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            onClick={disabled ? undefined : onClick}
            onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                    onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
            }}
            className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors ${
                disabled
                    ? "cursor-not-allowed text-gray-400"
                    : active
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : `text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${intentClass}`
            } ${className}`}
        >
            {icon && <Icon icon={icon} size={16} className="flex-shrink-0" />}
            <span className="flex-grow">{children ?? text}</span>
            {labelElement && <span className="text-xs text-gray-400">{labelElement}</span>}
        </div>
    );
};

export interface MenuDividerProps {
    /** Divider title */
    title?: string;
    /** Additional class name */
    className?: string;
}

export const MenuDivider: React.FC<MenuDividerProps> = ({ title, className = "" }) => {
    if (title) {
        return (
            <div className={`px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ${className}`}>
                {title}
            </div>
        );
    }

    return <hr className={`my-1 border-t border-gray-200 dark:border-gray-700 ${className}`} />;
};

export default Menu;
