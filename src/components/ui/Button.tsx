import * as React from "react";
import { Icon, type IconName } from "./Icon";
import { Intent, intentToBgClass, intentToOutlineClass } from "./intent";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button intent/color scheme */
    intent?: Intent;
    /** Icon to show on the left */
    icon?: IconName | string;
    /** Icon to show on the right */
    rightIcon?: IconName | string;
    /** Minimal style (no background, just text) */
    minimal?: boolean;
    /** Outlined style (border, no fill) */
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
}

/**
 * Button component with Blueprint-compatible API.
 * Built with Tailwind CSS, no Blueprint dependencies.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            intent = Intent.NONE,
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
            href,
            type = "button",
            ...props
        },
        ref,
    ) => {
        // Base classes
        const baseClasses = [
            "inline-flex items-center justify-center gap-2",
            "font-medium rounded transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        ];

        // Size classes
        const sizeClasses = small
            ? "h-7 px-2 text-xs"
            : large
              ? "h-11 px-5 text-base"
              : "h-9 px-3 text-sm";

        // Intent/variant classes
        let variantClasses: string;
        if (minimal) {
            variantClasses = `bg-transparent ${intentToOutlineClass[intent]} border-0`;
        } else if (outlined) {
            variantClasses = `bg-transparent border ${intentToOutlineClass[intent]}`;
        } else {
            variantClasses = intentToBgClass[intent];
        }

        // Active state
        const activeClasses = active ? "ring-2 ring-primary-500 ring-offset-1" : "";

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
                {children && <span>{children}</span>}
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

