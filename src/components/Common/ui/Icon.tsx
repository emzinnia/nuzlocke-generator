import React from "react";
import { LucideIcon } from "lucide-react";

type SvgIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type IconComponent = LucideIcon | SvgIcon;

interface IconProps {
    icon: IconComponent;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    size?: number;
    title?: string;
}

type IconElementProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    title?: string;
};

export const Icon: React.FC<IconProps> = ({
    icon,
    onClick,
    className = "",
    size = 16,
    title,
}) => {
    const IconComponent = icon as React.ComponentType<IconElementProps>;
    const mergedClassName = `${onClick ? "cursor-pointer" : ""} ${className}`.trim();

    return (
        <IconComponent
            size={size}
            width={size}
            height={size}
            onClick={onClick}
            className={mergedClassName}
            title={title}
            aria-label={title}
        />
    );
};

