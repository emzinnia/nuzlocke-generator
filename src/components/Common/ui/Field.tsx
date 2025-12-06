import React from "react";
import { Input } from "./Input";
import { Label } from "./Label";

export interface FieldProps {
    label: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    className?: string;
}

export const Field: React.FC<FieldProps> = ({
    label,
    inputProps,
    className,
}) => {
    return (
        <div className={`flex gap-1 w-full justify-between ${className || ""}`}>
            <Label>{label}</Label>
            <Input {...inputProps} />
        </div>
    );
};
