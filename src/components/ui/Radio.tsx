/**
 * Radio Component
 *
 * A radio button component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Label text */
    label?: React.ReactNode;
    /** Whether to display inline */
    inline?: boolean;
    /** Whether the radio is large */
    large?: boolean;
    /** Additional class name */
    className?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ label, inline = false, large = false, className = "", checked, disabled, ...props }, ref) => {
        const size = large ? "h-5 w-5" : "h-4 w-4";
        const innerSize = large ? "h-2.5 w-2.5" : "h-2 w-2";

        return (
            <label
                className={`flex cursor-pointer items-center gap-2 ${inline ? "inline-flex mr-4" : ""} ${
                    disabled ? "cursor-not-allowed opacity-50" : ""
                } ${className}`}
            >
                <div className="relative">
                    <input
                        ref={ref}
                        type="radio"
                        checked={checked}
                        disabled={disabled}
                        className="peer sr-only"
                        {...props}
                    />
                    <div
                        className={`${size} flex items-center justify-center rounded-full border transition-colors ${
                            checked
                                ? "border-blue-500"
                                : "border-gray-300 dark:border-gray-600"
                        } ${disabled ? "" : "peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2"}`}
                    >
                        {checked && (
                            <div className={`${innerSize} rounded-full bg-blue-500`} />
                        )}
                    </div>
                </div>
                {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
            </label>
        );
    }
);

Radio.displayName = "Radio";

export interface RadioGroupProps {
    /** Name for the radio group */
    name?: string;
    /** Selected value */
    selectedValue?: string | number;
    /** Change handler */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Whether to display inline */
    inline?: boolean;
    /** Additional class name */
    className?: string;
    /** Radio children */
    children?: React.ReactNode;
    /** Label for the group */
    label?: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    name,
    selectedValue,
    onChange,
    inline = false,
    className = "",
    children,
    label,
}) => {
    return (
        <div role="radiogroup" className={`${inline ? "flex flex-wrap gap-4" : "flex flex-col gap-2"} ${className}`}>
            {label && <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</div>}
            {React.Children.map(children, (child) => {
                if (React.isValidElement<RadioProps>(child)) {
                    return React.cloneElement(child, {
                        name,
                        checked: child.props.value === selectedValue,
                        onChange,
                        inline,
                    });
                }
                return child;
            })}
        </div>
    );
};

export default Radio;
