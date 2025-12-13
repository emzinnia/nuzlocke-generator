import React from "react";

interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked = false,
    onChange,
    label,
    disabled = false,
    className = "",
}) => {
    const handleChange = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    return (
        <label
            className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleChange}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                } ${disabled ? "cursor-not-allowed" : ""}`}
            >
                <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        checked ? "translate-x-4" : "translate-x-0"
                    }`}
                />
            </button>
            {label && (
                <span className="text-sm text-foreground">{label}</span>
            )}
        </label>
    );
};

