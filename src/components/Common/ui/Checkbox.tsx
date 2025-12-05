import React from "react";

interface CheckboxProps {
    label: string;
    onChange: (checked: boolean) => void;
    checked?: boolean;
    className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    onChange,
    checked,
    className = "",
}) => {
    return (
        <label
            className={`flex items-center gap-2 cursor-pointer select-none text-gray-700 dark:text-gray-300 ${className}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm">{label}</span>
        </label>
    );
};

