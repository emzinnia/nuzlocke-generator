import * as React from "react";
import { Icon, type IconName } from "./Icon";
import { Intent, intentToTextClass } from "./intent";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** Left icon */
    leftIcon?: IconName | string;
    /** Right icon */
    rightIcon?: IconName | string;
    /** Left element (overrides leftIcon) */
    leftElement?: React.ReactNode;
    /** Right element (overrides rightIcon) */
    rightElement?: React.ReactNode;
    /** Intent for validation states */
    intent?: Intent;
    /** Fill available width */
    fill?: boolean;
    /** Large size */
    large?: boolean;
    /** Small size */
    small?: boolean;
    /** Additional className for wrapper */
    className?: string;
    /** Additional className for input */
    inputClassName?: string;
}

/**
 * Input component with Blueprint-compatible API (InputGroup equivalent).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            leftIcon,
            rightIcon,
            leftElement,
            rightElement,
            intent = Intent.NONE,
            fill = false,
            large = false,
            small = false,
            disabled = false,
            className = "",
            inputClassName = "",
            ...props
        },
        ref,
    ) => {
        const intentBorderClass = {
            [Intent.NONE]: "border-border focus-within:border-primary-500",
            [Intent.PRIMARY]: "border-primary-500",
            [Intent.SUCCESS]: "border-success-500",
            [Intent.WARNING]: "border-warning-500",
            [Intent.DANGER]: "border-danger-500",
        };

        const sizeClass = small ? "h-7 text-xs" : large ? "h-11 text-base" : "h-9 text-sm";
        const iconSize = small ? 14 : large ? 18 : 16;

        const hasLeftContent = leftElement || leftIcon;
        const hasRightContent = rightElement || rightIcon;

        return (
            <div
                className={`relative inline-flex items-center rounded border bg-input transition-colors ${intentBorderClass[intent]} ${fill ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            >
                {hasLeftContent && (
                    <span className="flex items-center pl-2.5 text-fg-tertiary">
                        {leftElement || (leftIcon && <Icon icon={leftIcon} size={iconSize} />)}
                    </span>
                )}
                <input
                    ref={ref}
                    disabled={disabled}
                    className={`flex-1 bg-transparent px-2.5 outline-none placeholder:text-fg-tertiary disabled:cursor-not-allowed ${sizeClass} ${hasLeftContent ? "pl-1.5" : ""} ${hasRightContent ? "pr-1.5" : ""} ${inputClassName}`}
                    {...props}
                />
                {hasRightContent && (
                    <span className="flex items-center pr-2.5 text-fg-tertiary">
                        {rightElement || (rightIcon && <Icon icon={rightIcon} size={iconSize} />)}
                    </span>
                )}
            </div>
        );
    },
);

Input.displayName = "Input";

export default Input;

