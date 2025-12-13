import React from "react";

type SpinnerSize = "small" | "medium" | "large";

interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
    small: "w-4 h-4 border-2",
    medium: "w-6 h-6 border-2",
    large: "w-10 h-10 border-3",
};

export const Spinner: React.FC<SpinnerProps> = ({
    size = "medium",
    className = "",
}) => {
    return (
        <div
            className={`inline-block rounded-full border-primary/30 border-t-primary animate-spin ${sizeClasses[size]} ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
};

