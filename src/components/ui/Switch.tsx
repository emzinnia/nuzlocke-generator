/**
 * Switch Component
 *
 * A toggle switch component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Label text */
    label?: React.ReactNode;
    /** Inner label when on */
    innerLabelChecked?: string;
    /** Inner label when off */
    innerLabel?: string;
    /** Whether to display inline */
    inline?: boolean;
    /** Whether the switch is large */
    large?: boolean;
    /** Alignment of the indicator (left or right) */
    alignIndicator?: "left" | "right";
    /** Additional class name */
    className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    (
        {
            label,
            innerLabelChecked,
            innerLabel,
            inline = false,
            large = false,
            alignIndicator = "left",
            className = "",
            checked,
            disabled,
            ...props
        },
        ref
    ) => {
        const trackSize = large ? "h-6 w-11" : "h-5 w-9";
        const thumbSize = large ? "h-5 w-5" : "h-4 w-4";
        const thumbTranslate = large ? "translate-x-5" : "translate-x-4";

        const switchElement = (
            <div className="relative inline-flex items-center">
                <input
                    ref={ref}
                    type="checkbox"
                    role="switch"
                    aria-checked={checked}
                    checked={checked}
                    disabled={disabled}
                    className="peer sr-only"
                    {...props}
                />
                <div
                    className={`${trackSize} rounded-full transition-colors ${
                        checked
                            ? "bg-blue-500"
                            : "bg-gray-300 dark:bg-gray-600"
                    } ${disabled ? "opacity-50" : "peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"}`}
                >
                    <div
                        className={`${thumbSize} rounded-full bg-white shadow-sm transition-transform ${
                            checked ? thumbTranslate : "translate-x-0.5"
                        }`}
                        style={{ marginTop: "2px" }}
                    />
                </div>
                {(innerLabel || innerLabelChecked) && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {checked ? innerLabelChecked : innerLabel}
                    </span>
                )}
            </div>
        );

        return (
            <label
                className={`flex cursor-pointer items-center gap-2 ${inline ? "inline-flex" : ""} ${
                    alignIndicator === "right" ? "flex-row-reverse" : ""
                } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
            >
                {switchElement}
                {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
            </label>
        );
    }
);

Switch.displayName = "Switch";

export default Switch;
