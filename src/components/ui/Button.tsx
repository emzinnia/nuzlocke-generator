import * as React from "react";
import { Icon, type IconName } from "./Icon";
import {
    Intent,
    intentToBgClass,
    intentToOutlineClass,
    intentToGhostClass,
    intentToLinkClass,
} from "./intent";
import { Spinner } from "./Spinner";
import { HotkeyIndicator } from "components/Common/Shared";

export type ButtonVariant = "solid" | "outline" | "ghost" | "link";

export interface ButtonHotkeyProps {
    /** The key to display (e.g., "Z", "Y", "S") */
    key: string;
    /** Whether to show the modifier key (Cmd/Ctrl). Defaults to true */
    showModifier?: boolean;
    /** Custom modifier to use instead of the platform default */
    modifier?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button intent/color scheme */
    intent?: Intent;
    /** Button variant style */
    variant?: ButtonVariant;
    /** Icon to show on the left */
    icon?: IconName | string;
    /** Icon to show on the right */
    rightIcon?: IconName | string;
    /** @deprecated Use variant="ghost" instead. Minimal style (no background, just text) */
    minimal?: boolean;
    /** @deprecated Use variant="outline" instead. Outlined style (border, no fill) */
    outlined?: boolean;
    /** Large size variant */
    large?: boolean;
    /** Small size variant */
    small?: boolean;
    /** Fill available width */
    fill?: boolean;
    /** Show loading spinner */
    loading?: boolean;
    /** Render as anchor tag (for links) */
    href?: string;
    /** Text alignment */
    alignText?: "left" | "center" | "right";
    /** Active/pressed state */
    active?: boolean;
    /** Hotkey indicator to display after the button text */
    hotkey?: ButtonHotkeyProps;
}

/**
 * Button component with Blueprint-compatible API.
 * Built with Tailwind CSS, no Blueprint dependencies.
 *
 * Variants:
 * - solid: Filled background (default for primary actions)
 * - outline: Border with transparent background
 * - ghost: No border, subtle hover background
 * - link: Looks like a link, underline on hover
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            intent = Intent.NONE,
            variant,
            icon,
            rightIcon,
            minimal = false,
            outlined = false,
            large = false,
            small = false,
            fill = false,
            loading = false,
            disabled = false,
            className = "",
            alignText = "center",
            active = false,
            hotkey,
            href,
            type = "button",
            ...props
        },
        ref,
    ) => {
        // Determine effective variant (support legacy minimal/outlined props)
        let effectiveVariant: ButtonVariant = variant ?? "solid";
        if (!variant) {
            if (minimal) effectiveVariant = "ghost";
            else if (outlined) effectiveVariant = "outline";
        }

        // Base classes
        const baseClasses = [
            "inline-flex items-center justify-center gap-1.5",
            "font-medium rounded-md transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        ];

        // Focus ring color based on intent
        const focusRingClass =
            intent === Intent.DANGER
                ? "focus-visible:ring-danger-500"
                : intent === Intent.SUCCESS
                  ? "focus-visible:ring-success-500"
                  : intent === Intent.WARNING
                    ? "focus-visible:ring-warning-500"
                    : "focus-visible:ring-primary-500";

        // Size classes
        const sizeClasses =
            effectiveVariant === "link"
                ? small
                    ? "text-xs"
                    : large
                      ? "text-base"
                      : "text-sm"
                : small
                  ? "h-7 px-2.5 text-xs"
                  : large
                    ? "h-11 px-5 text-base"
                    : "h-9 px-3.5 text-sm";

        // Variant classes based on effective variant
        let variantClasses: string;
        switch (effectiveVariant) {
            case "outline":
                variantClasses = intentToOutlineClass[intent];
                break;
            case "ghost":
                variantClasses = intentToGhostClass[intent];
                break;
            case "link":
                variantClasses = intentToLinkClass[intent];
                break;
            case "solid":
            default:
                variantClasses = intentToBgClass[intent];
                break;
        }

        // Active state
        const activeClasses = active
            ? "ring-2 ring-offset-1 " +
              (intent === Intent.DANGER
                  ? "ring-danger-500"
                  : intent === Intent.SUCCESS
                    ? "ring-success-500"
                    : intent === Intent.WARNING
                      ? "ring-warning-500"
                      : "ring-primary-500")
            : "";

        // Width
        const widthClasses = fill ? "w-full" : "";

        // Text alignment
        const alignClasses =
            alignText === "left"
                ? "justify-start text-left"
                : alignText === "right"
                  ? "justify-end text-right"
                  : "justify-center text-center";

        const allClasses = [
            ...baseClasses,
            focusRingClass,
            sizeClasses,
            variantClasses,
            activeClasses,
            widthClasses,
            alignClasses,
            className,
        ]
            .filter(Boolean)
            .join(" ");

        const iconSize = small ? 14 : large ? 20 : 16;

        const content = (
            <>
                {loading ? (
                    <Spinner size={iconSize} />
                ) : icon ? (
                    <Icon icon={icon} size={iconSize} />
                ) : null}
                {children && <span className="whitespace-nowrap">{children}</span>}
                {hotkey && (
                    <HotkeyIndicator
                        hotkey={hotkey.key}
                        showModifier={hotkey.showModifier}
                        modifier={hotkey.modifier}
                        style={{ marginLeft: "0.35rem" }}
                    />
                )}
                {rightIcon && !loading && <Icon icon={rightIcon} size={iconSize} />}
            </>
        );

        // Render as anchor if href provided
        if (href && !disabled) {
            return (
                <a
                    href={href}
                    className={allClasses}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {content}
                </a>
            );
        }

        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled || loading}
                className={allClasses}
                {...props}
            >
                {content}
            </button>
        );
    },
);

Button.displayName = "Button";

export default Button;

