import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Intent } from "./intent";

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type" | "size"> {
    /** Current value */
    value?: number;
    /** Change handler */
    onValueChange?: (value: number | undefined) => void;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step increment */
    stepSize?: number;
    /** Intent for validation states */
    intent?: Intent;
    /** Fill available width */
    fill?: boolean;
    /** Large size */
    large?: boolean;
    /** Small size */
    small?: boolean;
    /** Allow empty value */
    allowNumericCharactersOnly?: boolean;
    /** Left icon */
    leftIcon?: React.ReactNode;
    /** Major step (shift+arrow) */
    majorStepSize?: number;
    /** Minor step (alt+arrow) */
    minorStepSize?: number;
}

/**
 * NumericInput component with Blueprint-compatible API.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            value,
            onValueChange,
            min,
            max,
            stepSize = 1,
            majorStepSize = 10,
            minorStepSize = 0.1,
            intent = Intent.NONE,
            fill = false,
            large = false,
            small = false,
            disabled = false,
            className = "",
            leftIcon,
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
        const buttonSize = small ? 12 : large ? 16 : 14;

        const clamp = (val: number) => {
            let result = val;
            if (min !== undefined) result = Math.max(min, result);
            if (max !== undefined) result = Math.min(max, result);
            return result;
        };

        const increment = (step: number) => {
            const newValue = clamp((value ?? 0) + step);
            onValueChange?.(newValue);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (val === "") {
                onValueChange?.(undefined);
            } else {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    onValueChange?.(clamp(num));
                }
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                const step = e.shiftKey ? majorStepSize : e.altKey ? minorStepSize : stepSize;
                increment(step);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const step = e.shiftKey ? majorStepSize : e.altKey ? minorStepSize : stepSize;
                increment(-step);
            }
        };

        return (
            <div
                className={`relative inline-flex items-center rounded border bg-input transition-colors ${intentBorderClass[intent]} ${fill ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            >
                {leftIcon && <span className="flex items-center pl-2.5 text-fg-tertiary">{leftIcon}</span>}
                <input
                    ref={ref}
                    type="text"
                    inputMode="decimal"
                    value={value ?? ""}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className={`flex-1 bg-transparent px-2.5 outline-none placeholder:text-fg-tertiary disabled:cursor-not-allowed ${sizeClass} ${leftIcon ? "pl-1.5" : ""}`}
                    {...props}
                />
                <div className="flex flex-col border-l border-border">
                    <button
                        type="button"
                        disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
                        onClick={() => increment(stepSize)}
                        className="flex items-center justify-center px-1.5 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700"
                    >
                        <ChevronUp size={buttonSize} />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
                        onClick={() => increment(-stepSize)}
                        className="flex items-center justify-center border-t border-border px-1.5 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700"
                    >
                        <ChevronDown size={buttonSize} />
                    </button>
                </div>
            </div>
        );
    },
);

NumericInput.displayName = "NumericInput";

export default NumericInput;

