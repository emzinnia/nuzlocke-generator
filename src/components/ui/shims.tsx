/**
 * Blueprint Compatibility Shims
 *
 * Re-exports internal UI components with Blueprint-compatible API.
 * Use this during migration to incrementally replace Blueprint imports.
 *
 * Once migration is complete, remove this file and update imports
 * to use the internal UI library directly.
 *
 * Usage (during migration):
 *   import { Button, Dialog, Intent } from "components/ui/shims";
 *
 * After migration:
 *   import { Button, Dialog, Intent } from "components/ui";
 */

import * as React from "react";

// Re-export all internal UI components
export * from "./index";

// Blueprint-specific type shims for compatibility

/** Blueprint Position enum - mapped to our position types */
export const Position = {
    TOP: "top" as const,
    TOP_LEFT: "top-start" as const,
    TOP_RIGHT: "top-end" as const,
    BOTTOM: "bottom" as const,
    BOTTOM_LEFT: "bottom-start" as const,
    BOTTOM_RIGHT: "bottom-end" as const,
    LEFT: "left" as const,
    LEFT_TOP: "left-start" as const,
    LEFT_BOTTOM: "left-end" as const,
    RIGHT: "right" as const,
    RIGHT_TOP: "right-start" as const,
    RIGHT_BOTTOM: "right-end" as const,
};

/** Blueprint Classes constants - common class name helpers */
export const Classes = {
    // Form classes
    INPUT: "ui-input",
    INPUT_GROUP: "ui-input-group",
    FILL: "w-full",
    MINIMAL: "ui-minimal",
    CONTROL: "ui-control",
    CHECKBOX: "ui-checkbox",
    SWITCH: "ui-switch",
    RADIO: "ui-radio",
    LABEL: "ui-label",
    INLINE: "inline-flex items-center gap-2",
    SELECT: "ui-select",
    CONTROL_INDICATOR: "ui-control-indicator",
    CODE: "font-mono text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded",
    FILE_INPUT: "ui-file-input",

    // Dialog classes
    DIALOG: "ui-dialog",
    DIALOG_BODY: "ui-dialog-body",
    DIALOG_FOOTER: "ui-dialog-footer",
    DIALOG_FOOTER_ACTIONS: "ui-dialog-footer-actions flex gap-2 justify-end",
    DIALOG_HEADER: "ui-dialog-header",

    // Button classes
    BUTTON: "ui-button",
    BUTTON_GROUP: "ui-button-group",

    // Layout classes
    POPOVER_CONTENT_SIZING: "ui-popover-content-sizing",
    POPOVER: "ui-popover",

    // Menu classes
    MENU: "ui-menu",
    MENU_ITEM: "ui-menu-item",

    // Tag classes
    TAG: "ui-tag",
    TAG_INPUT: "ui-tag-input",

    // Text classes
    TEXT_MUTED: "text-gray-500 dark:text-gray-400",

    // State classes
    DISABLED: "opacity-50 pointer-events-none",
    ACTIVE: "active",
    LOADING: "loading",

    // Dark mode (legacy - use .dark now)
    DARK: "dark",
};

/** Blueprint PopoverInteractionKind enum */
export const PopoverInteractionKind = {
    CLICK: "click" as const,
    CLICK_TARGET_ONLY: "click" as const,
    HOVER: "hover" as const,
    HOVER_TARGET_ONLY: "hover" as const,
};

/** Blueprint DrawerSize - common drawer widths */
export const DrawerSize = {
    SMALL: "360px" as const,
    STANDARD: "500px" as const,
    LARGE: "90%" as const,
};

/** Blueprint Alignment enum */
export const Alignment = {
    LEFT: "left" as const,
    CENTER: "center" as const,
    RIGHT: "right" as const,
};

// Type exports for compatibility
export type IconName = string;

// Legacy prop type shims (for gradual migration)
export interface LegacyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    icon?: React.ReactNode;
    canEscapeKeyClose?: boolean;
    canOutsideClickClose?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export interface LegacyButtonProps {
    text?: React.ReactNode;
    icon?: string;
    rightIcon?: string;
    intent?: "none" | "primary" | "success" | "warning" | "danger";
    minimal?: boolean;
    outlined?: boolean;
    large?: boolean;
    small?: boolean;
    fill?: boolean;
    loading?: boolean;
    disabled?: boolean;
    active?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    className?: string;
    children?: React.ReactNode;
}

// HTML Select shim (Blueprint's HTMLSelect component)
export interface HTMLSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options?: Array<{ value: string; label: string } | string>;
    fill?: boolean;
    large?: boolean;
    minimal?: boolean;
    iconName?: string;
}

export const HTMLSelect = React.forwardRef<HTMLSelectElement, HTMLSelectProps>(
    ({ options = [], fill, large, minimal, iconName, className = "", children, ...props }, ref) => {
        const sizeClass = large ? "h-11 text-base" : "h-9 text-sm";

        return (
            <select
                ref={ref}
                className={`rounded border border-border bg-input px-3 outline-none transition-colors focus:border-primary-500 ${sizeClass} ${fill ? "w-full" : ""} ${className}`}
                {...props}
            >
                {options.map((option) => {
                    const value = typeof option === "string" ? option : option.value;
                    const label = typeof option === "string" ? option : option.label;
                    return (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    );
                })}
                {children}
            </select>
        );
    },
);

HTMLSelect.displayName = "HTMLSelect";

// H4 component (Blueprint typography)
export const H4: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className = "",
    ...props
}) => (
    <h4 className={`text-lg font-semibold text-fg-primary ${className}`} {...props}>
        {children}
    </h4>
);

// NonIdealState component
export interface NonIdealStateProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const NonIdealState: React.FC<NonIdealStateProps> = ({
    icon,
    title,
    description,
    action,
    className = "",
}) => (
    <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        {icon && <div className="mb-4 text-fg-tertiary">{icon}</div>}
        {title && <h4 className="mb-2 text-lg font-semibold text-fg-primary">{title}</h4>}
        {description && <p className="mb-4 text-fg-secondary">{description}</p>}
        {action && <div>{action}</div>}
    </div>
);

// Alert component (Blueprint's Alert)
export interface AlertProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
    intent?: "none" | "primary" | "success" | "warning" | "danger";
    icon?: React.ReactNode;
    children?: React.ReactNode;
    canEscapeKeyCancel?: boolean;
    canOutsideClickCancel?: boolean;
    className?: string;
}

// Note: Alert should be imported from Dialog and composed
// This is a placeholder that can be used with our Dialog component

// Additional Blueprint component shims for missing types

// DialogProps alias (for components that import DialogProps from Blueprint)
export type DialogProps = LegacyDialogProps;

// Toast-related re-exports
export { Toaster, Toast } from "./index";

// OverlayToaster shim (alias for Toaster)
export { Toaster as OverlayToaster } from "./Toast";

// ToastProps re-export
export type { ToastProps } from "./Toast";

// InputGroup shim (wraps Input with Blueprint-like API)
import { Icon } from "./Icon";

export interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: string;
    rightElement?: React.ReactNode;
    intent?: "none" | "primary" | "success" | "warning" | "danger";
    fill?: boolean;
    large?: boolean;
    small?: boolean;
    round?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
    leftIcon,
    rightElement,
    intent,
    fill,
    large,
    small,
    round,
    className = "",
    ...props
}) => {
    return (
        <div className={`relative flex items-center ${fill ? "w-full" : ""} ${className}`}>
            {leftIcon && (
                <span className="absolute left-2 text-fg-tertiary">
                    <Icon icon={leftIcon} size={16} />
                </span>
            )}
            <input
                className={`w-full rounded border border-border bg-input px-3 outline-none transition-colors focus:border-primary-500 ${leftIcon ? "pl-8" : ""} ${rightElement ? "pr-8" : ""} ${large ? "h-11 text-base" : small ? "h-7 text-xs" : "h-9 text-sm"} ${round ? "rounded-full" : ""}`}
                {...props}
            />
            {rightElement && (
                <span className="absolute right-2">
                    {rightElement}
                </span>
            )}
        </div>
    );
};

// RadioGroup shim
export { RadioGroup } from "./Radio";

// Divider component
export const Divider: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({
    className = "",
    ...props
}) => (
    <hr className={`border-t border-border my-2 ${className}`} {...props} />
);

// Drawer component shim
export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    size?: string;
    title?: React.ReactNode;
    icon?: string;
    className?: string;
    children?: React.ReactNode;
    position?: "left" | "right" | "top" | "bottom";
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    size = "500px",
    title,
    icon,
    className = "",
    children,
    position = "right",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            {/* Drawer panel */}
            <div
                className={`absolute ${position === "right" ? "right-0 top-0 bottom-0" : "left-0 top-0 bottom-0"} bg-bg-primary shadow-xl ${className}`}
                style={{ width: size }}
            >
                {title && (
                    <div className="flex items-center gap-2 border-b border-border p-4">
                        {icon && <Icon icon={icon} size={16} />}
                        <h3 className="font-semibold">{title}</h3>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

// Tree component placeholder (minimal implementation)
export interface TreeNodeInfo {
    id: string | number;
    label: React.ReactNode;
    icon?: string;
    isExpanded?: boolean;
    isSelected?: boolean;
    childNodes?: TreeNodeInfo[];
    nodeData?: any;
}

export interface TreeProps {
    contents: TreeNodeInfo[];
    onNodeClick?: (node: TreeNodeInfo, nodePath: number[], e: React.MouseEvent) => void;
    onNodeCollapse?: (node: TreeNodeInfo) => void;
    onNodeExpand?: (node: TreeNodeInfo) => void;
    className?: string;
}

export const Tree: React.FC<TreeProps> = ({
    contents,
    onNodeClick,
    onNodeCollapse,
    onNodeExpand,
    className = "",
}) => {
    const renderNode = (node: TreeNodeInfo, path: number[]) => (
        <div key={node.id} className={`tree-node ${node.isSelected ? "bg-primary-100 dark:bg-primary-900" : ""}`}>
            <div
                className="flex items-center gap-2 p-1 cursor-pointer hover:bg-bg-secondary rounded"
                onClick={(e) => onNodeClick?.(node, path, e)}
            >
                {node.childNodes && node.childNodes.length > 0 && (
                    <button
                        type="button"
                        className="text-fg-tertiary"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (node.isExpanded) {
                                onNodeCollapse?.(node);
                            } else {
                                onNodeExpand?.(node);
                            }
                        }}
                    >
                        {node.isExpanded ? "▼" : "▶"}
                    </button>
                )}
                <span>{node.label}</span>
            </div>
            {node.isExpanded && node.childNodes && (
                <div className="pl-4">
                    {node.childNodes.map((child, idx) => renderNode(child, [...path, idx]))}
                </div>
            )}
        </div>
    );

    return (
        <div className={`tree ${className}`}>
            {contents.map((node, idx) => renderNode(node, [idx]))}
        </div>
    );
};

// Elevation type (for Card)
export type { Elevation } from "./Card";

// Elevation enum values for Blueprint compatibility
export const Elevation = {
    ZERO: 0 as const,
    ONE: 1 as const,
    TWO: 2 as const,
    THREE: 3 as const,
    FOUR: 4 as const,
};

// Alert component (uses Dialog internally)
export { Dialog as Alert } from "./Dialog";

