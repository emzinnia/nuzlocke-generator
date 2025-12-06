import React from "react";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    return (
        <input
            {...props}
            className={`px-2 py-1.5 text-sm border border-border bg-input text-foreground placeholder-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${className || ''}`}
        />
    );
};
