/**
 * Select Component
 *
 * A select component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";
import './Select.css';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
    /** Options to display */
    options?: SelectOption[] | string[];
    /** Whether to fill the container width */
    fill?: boolean;
    /** Whether the select is large */
    large?: boolean;
    /** Whether to use minimal styling */
    minimal?: boolean;
    /** Icon name (not used, for Blueprint compatibility) */
    iconName?: string;
    /** Additional class name */
    className?: string;
    /** Children (alternative to options) */
    children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ options = [], fill = false, large = false, minimal = false, iconName, className = "", children, ...props }, ref) => {
        const sizeClass = large ? "h-11 text-base" : "h-9 text-sm";

        return (
            <div className={`relative inline-block ${fill ? "w-full" : ""}`}>
                <select
                    ref={ref}
                    className={`ui-select rounded border bg-white outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800  ${sizeClass} ${
                        fill ? "w-full" : ""
                    } ${
                        minimal
                            ? "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                            : "border-gray-300 dark:border-gray-600"
                    } ${props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
                    {...props}
                >
                    <button>
                        <div>
                            <selectedcontent> </selectedcontent>
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path fill="currentColor" d="m7 10l5 5l5-5z"/>
                            </svg>
                        </div>
                    </button>
                    {options.map((option) => {
                        const value = typeof option === "string" ? option : option.value;
                        const label = typeof option === "string" ? option : option.label;
                        const disabled = typeof option === "string" ? false : option.disabled;
                        return (
                            <option className="ui-select-option p-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" key={value} value={value} disabled={disabled}>
                                {label}
                            </option>
                        );
                    })}
                    {children}
                </select>
                
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
