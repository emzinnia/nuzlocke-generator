/**
 * Checkbox Component
 *
 * A checkbox component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";

interface InlineIconProps {
    size: number;
    strokeWidth?: number;
}

const CheckIcon: React.FC<InlineIconProps> = ({ size, strokeWidth = 3 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const MinusIcon: React.FC<InlineIconProps> = ({ size, strokeWidth = 3 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Label text */
    label?: React.ReactNode;
    /** Whether the checkbox is indeterminate */
    indeterminate?: boolean;
    /** Whether to display inline */
    inline?: boolean;
    /** Whether the checkbox is large */
    large?: boolean;
    /** Additional class name */
    className?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, indeterminate = false, inline = false, large = false, className = "", checked, disabled, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const combinedRef = (ref as React.MutableRefObject<HTMLInputElement | null>) || inputRef;

        React.useEffect(() => {
            if (combinedRef.current) {
                combinedRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate, combinedRef]);

        const size = large ? "h-5 w-5" : "h-4 w-4";
        const iconSize = large ? 14 : 12;

        return (
            <label
                className={`flex cursor-pointer items-center gap-2 px-2 py-1.5 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${inline ? "inline-flex" : ""} ${
                    disabled ? "cursor-not-allowed opacity-50" : ""
                } ${className}`}
            >
                <div className="relative flex-shrink-0">
                    <input
                        ref={combinedRef}
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        className="peer sr-only"
                        {...props}
                    />
                    <div
                        className={`${size} flex items-center justify-center rounded border-2 transition-colors ${
                            checked || indeterminate
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-gray-400 bg-transparent dark:border-gray-500"
                        } ${disabled ? "" : "peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"}`}
                    >
                        {indeterminate ? (
                            <MinusIcon size={iconSize} strokeWidth={3} />
                        ) : checked ? (
                            <CheckIcon size={iconSize} strokeWidth={3} />
                        ) : null}
                    </div>
                </div>
                {label && (
                    <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
