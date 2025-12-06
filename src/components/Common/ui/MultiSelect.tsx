import React from "react";
import { Button } from "./Button";

export interface MultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    max?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value,
    onChange,
    max,
    placeholder = "Select...",
    disabled = false,
    className,
}) => {
    const availableOptions = options.filter((opt) => !value.includes(opt));
    const canAddMore = max === undefined || value.length < max;

    const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected && !value.includes(selected) && canAddMore) {
            onChange([...value, selected]);
        }
        e.target.value = "";
    };

    const handleRemove = (item: string) => {
        onChange(value.filter((v) => v !== item));
    };

    return (
        <div className={`space-y-1 ${className || ''}`}>
            {/* Selected items as tags */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {value.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary-foreground text-primary rounded-full"
                        >
                            {item}
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="icon"
                                    onClick={() => handleRemove(item)}
                                    className="p-0.5 hover:text-primary-foreground"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown to add more */}
            {canAddMore && availableOptions.length > 0 && (
                <select
                    onChange={handleAdd}
                    disabled={disabled}
                    defaultValue=""
                    className="w-full px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                    <option value="" disabled>
                        {placeholder} {max && `(${value.length}/${max})`}
                    </option>
                    {availableOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            )}

            {/* Show message when max reached */}
            {max && value.length >= max && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum {max} selected
                </div>
            )}
        </div>
    );
};

