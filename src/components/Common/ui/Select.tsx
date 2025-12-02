import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: readonly { value: string; label: string }[] | readonly string[];
}

export const Select: React.FC<SelectProps> = ({ options, className, ...props }) => {
    return (
        <select
            {...props}
            className={`px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${className || ''}`}
        >
            {options.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            })}
        </select>
    );
};

