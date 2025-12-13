import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";

interface MenuProps {
    children: React.ReactNode;
    className?: string;
}

interface MenuItemProps {
    children?: React.ReactNode;
    text?: React.ReactNode;
    onSelect?: () => void;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const Menu: React.FC<MenuProps> = ({ children, className = "" }) => {
    return (
        <div
            className={`min-w-[160px] rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1 z-10 ${className}`}
        >
            {children}
        </div>
    );
};

export const MenuItem: React.FC<MenuItemProps> = ({
    children,
    text,
    onSelect,
    onClick,
    disabled = false,
    danger = false,
    icon,
    className = "",
}) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const hasSubmenu = React.Children.count(children) > 0;
    const handleClick = onSelect || onClick;

    const handleMouseEnter = () => {
        if (hasSubmenu) {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            setIsSubmenuOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (hasSubmenu) {
            timeoutRef.current = window.setTimeout(() => {
                setIsSubmenuOpen(false);
            }, 150);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const baseClasses =
        "w-full px-3 py-2 text-sm text-left flex items-center gap-2 rounded-sm transition-colors";
    const stateClasses = disabled
        ? "opacity-60 cursor-not-allowed"
        : danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
          : "hover:bg-accent hover:text-accent-foreground cursor-pointer";

    if (hasSubmenu) {
        return (
            <div
                ref={itemRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className={`${baseClasses} ${stateClasses} ${className}`}
                >
                    {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
                    <span className="flex-1">{text}</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                </div>
                {isSubmenuOpen && (
                    <div className="absolute left-full top-0 ml-1">
                        <Menu>{children}</Menu>
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={!disabled ? handleClick : undefined}
            disabled={disabled}
            aria-disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${className}`}
        >
            {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
            <span className="flex-1">{text || children}</span>
        </button>
    );
};

export const MenuDivider: React.FC = () => {
    return <div className="my-1 h-px bg-border" />;
};
