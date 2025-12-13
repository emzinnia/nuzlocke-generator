import React from "react";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    fill?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
    className = "",
    fill = false,
    ...props
}) => {
    return (
        <textarea
            {...props}
            className={`px-3 py-2 text-sm border border-border bg-input text-foreground placeholder-muted-foreground rounded-md resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                fill ? "w-full" : ""
            } ${className}`}
        />
    );
};

