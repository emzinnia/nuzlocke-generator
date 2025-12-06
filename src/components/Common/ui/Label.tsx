import React from "react";

interface LabelProps {
    children: React.ReactNode;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className }) => {
    return <label className={`text-xs text-left font-medium text-muted-foreground ${className}`}>{children}</label>;
};