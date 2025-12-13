import React from "react";
import {
    Plus,
    Download,
    Undo2,
    Redo2,
    Menu,
    X,
    Eye,
    Sun,
    Moon,
    Star,
    Minimize2,
    Maximize2,
    Trash2,
    Copy,
    Search,
    ChevronUp,
    ChevronDown,
    Upload,
    Heart,
    HeartCrack,
    Settings,
    Info,
    AlertTriangle,
    Check,
    Pencil,
    Image,
    Save,
    FolderOpen,
    ArrowLeftRight,
    Crown,
    MoreVertical,
    ZoomIn,
    ZoomOut,
    LayoutGrid,
    Link,
    type LucideIcon,
} from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "icon";
type ButtonIntent = "none" | "primary" | "success" | "warning" | "danger";

const iconMap: Record<string, LucideIcon> = {
    add: Plus,
    download: Download,
    undo: Undo2,
    redo: Redo2,
    menu: Menu,
    cross: X,
    "eye-open": Eye,
    flash: Sun,
    moon: Moon,
    star: Star,
    minimize: Minimize2,
    maximize: Maximize2,
    trash: Trash2,
    duplicate: Copy,
    search: Search,
    "symbol-triangle-up": ChevronUp,
    "symbol-triangle-down": ChevronDown,
    upload: Upload,
    heart: Heart,
    "heart-broken": HeartCrack,
    cog: Settings,
    info: Info,
    warning: AlertTriangle,
    tick: Check,
    edit: Pencil,
    media: Image,
    "floppy-disk": Save,
    "folder-open": FolderOpen,
    plus: Plus,
    list: Menu,
    "info-sign": Info,
    "swap-horizontal": ArrowLeftRight,
    clipboard: Copy,
    crown: Crown,
    more: MoreVertical,
    "zoom-in": ZoomIn,
    "zoom-out": ZoomOut,
    "grid-view": LayoutGrid,
    link: Link,
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    intent?: ButtonIntent;
    icon?: string | React.ReactNode;
    rightIcon?: string | React.ReactNode;
    minimal?: boolean;
    fill?: boolean;
    small?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "px-3 py-2 bg-primary text-white border-transparent hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
        "px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus-visible:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700",
    outline:
        "px-3 py-2 border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost:
        "px-3 py-2 border border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
    icon:
        "p-2 border border-transparent text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-200 rounded-full dark:text-gray-300 dark:hover:bg-gray-800",
};

const intentClasses: Record<ButtonIntent, string> = {
    none: "",
    primary: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
    success: "bg-green-500 text-white hover:bg-green-600 border-green-500",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500",
    danger: "bg-red-500 text-white hover:bg-red-600 border-red-500",
};

const minimalIntentClasses: Record<ButtonIntent, string> = {
    none: "",
    primary: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30",
    success: "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30",
    warning: "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30",
    danger: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30",
};

function renderIcon(icon: string | React.ReactNode, size = 16): React.ReactNode {
    if (typeof icon === "string") {
        const IconComponent = iconMap[icon];
        if (IconComponent) {
            return <IconComponent size={size} />;
        }
        return null;
    }
    return icon;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    intent = "none",
    icon,
    rightIcon,
    minimal = false,
    fill = false,
    small = false,
    className = "",
    disabled,
    ...props
}) => {
    const baseClasses =
        "inline-flex items-center justify-center gap-2 text-sm font-medium rounded-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    let appliedClasses = variantClasses[variant];

    if (minimal) {
        appliedClasses = "px-3 py-2 bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-current";
        if (intent !== "none") {
            appliedClasses += " " + minimalIntentClasses[intent];
        }
    } else if (intent !== "none") {
        appliedClasses = "px-3 py-2 " + intentClasses[intent];
    }

    const sizeClasses = small ? "px-2 py-1 text-xs" : "";
    const fillClasses = fill ? "w-full" : "";

    return (
        <button
            className={`${baseClasses} ${appliedClasses} ${sizeClasses} ${fillClasses} ${className}`}
            disabled={disabled}
            {...props}
        >
            {icon && renderIcon(icon, small ? 14 : 16)}
            {children}
            {rightIcon && renderIcon(rightIcon, small ? 14 : 16)}
        </button>
    );
};
