import React from "react";
import { Input } from "./Input";

export interface FieldProps {
    label: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, inputProps, className }) => {
    return (
        <div className={`flex gap-1 w-full justify-between ${className || ''}`}>
            <label className="text-xs text-left font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <Input {...inputProps} />
        </div>
    );
};
