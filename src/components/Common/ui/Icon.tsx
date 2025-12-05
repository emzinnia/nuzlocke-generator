import React from "react";
import { LucideIcon } from "lucide-react";

interface IconProps {
    icon: LucideIcon;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    size?: number;
    title?: string;
}

export const Icon: React.FC<IconProps> = ({
    icon: LucideIconComponent,
    onClick,
    className = "",
    size = 16,
    title,
}) => {
    return (
        <LucideIconComponent
            size={size}
            onClick={onClick}
            className={`${onClick ? "cursor-pointer" : ""} ${className}`}
            title={title}
            aria-label={title}
        />
    );
};

