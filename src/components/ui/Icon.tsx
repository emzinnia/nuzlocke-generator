import * as React from "react";
import {
    Plus,
    Trash2,
    Heart,
    HeartCrack,
    Download,
    Star,
    X,
    Edit,
    AlertCircle,
    AlertTriangle,
    Info,
    Check,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    GripVertical,
    Copy,
    FileText,
    Search,
    Upload,
    ZoomIn,
    ZoomOut,
    User,
    Award,
    Grid,
    Grid3X3,
    Filter,
    Link,
    Menu,
    Maximize2,
    Minimize2,
    Sun,
    Moon,
    Eye,
    EyeOff,
    Settings,
    Save,
    FolderOpen,
    RefreshCw,
    RotateCcw,
    Undo,
    Redo,
    Lock,
    Unlock,
    MoreHorizontal,
    MoreVertical,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowLeftRight,
    Clipboard,
    Crown,
    Box,
    Palette,
    Image,
    LayoutGrid,
    Circle,
    Swords,
    List,
    BarChart3,
    Lightbulb,
    Database,
    Import,
    FileOutput,
    Command,
    Square,
    type LucideIcon,
} from "lucide-react";

/**
 * Map Blueprint icon names to Lucide icons.
 * Add new mappings as you encounter them during migration.
 */
const iconMap: Record<string, LucideIcon> = {
    // Common actions
    add: Plus,
    plus: Plus,
    trash: Trash2,
    delete: Trash2,
    cross: X,
    edit: Edit,
    duplicate: Copy,
    download: Download,
    upload: Upload,
    search: Search,
    link: Link,
    filter: Filter,
    save: Save,
    "floppy-disk": Save,
    refresh: RefreshCw,
    reset: RotateCcw,
    undo: Undo,
    redo: Redo,
    lock: Lock,
    unlock: Unlock,
    "more-horizontal": MoreHorizontal,
    "more-vertical": MoreVertical,
    "folder-open": FolderOpen,
    settings: Settings,
    cog: Settings,

    // Status & feedback
    tick: Check,
    "small-tick": Check,
    error: AlertCircle,
    "warning-sign": AlertTriangle,
    "info-sign": Info,
    star: Star,
    heart: Heart,
    "heart-broken": HeartCrack,

    // Navigation & UI
    menu: Menu,
    "caret-down": ChevronDown,
    "caret-up": ChevronUp,
    "caret-left": ChevronLeft,
    "caret-right": ChevronRight,
    "chevron-down": ChevronDown,
    "chevron-up": ChevronUp,
    "chevron-left": ChevronLeft,
    "chevron-right": ChevronRight,
    "double-caret-vertical": ChevronsUpDown,
    "drag-handle-vertical": GripVertical,
    "arrow-up": ArrowUp,
    "arrow-down": ArrowDown,
    "arrow-left": ArrowLeft,
    "arrow-right": ArrowRight,

    // Window controls
    maximize: Maximize2,
    minimize: Minimize2,

    // Theme
    flash: Sun,
    moon: Moon,
    "eye-open": Eye,
    "eye-off": EyeOff,

    // Objects
    document: FileText,
    person: User,
    badge: Award,
    grid: Grid,

    // Zoom
    "zoom-in": ZoomIn,
    "zoom-out": ZoomOut,

    // Triangles/Arrows (Blueprint symbol icons)
    "symbol-triangle-up": ChevronUp,
    "symbol-triangle-down": ChevronDown,

    // History/Time
    history: RotateCcw,
    record: Moon, // Using Moon as a placeholder for record dot

    // Arrows
    "arrow-left-right": ArrowLeftRight,

    // Actions
    clipboard: Clipboard,
    more: MoreHorizontal,

    // Objects & Symbols
    crown: Crown,
    cube: Box,
    style: Palette,
    media: Image,
    "layout-group-by": LayoutGrid,
    circle: Circle,
    ninja: Swords, // Using Swords as a substitute for ninja
    list: List,
    chart: BarChart3,
    lightbulb: Lightbulb,
    database: Database,
    import: Import,
    export: FileOutput,
    "grid-view": LayoutGrid,
    "document-open": FolderOpen,
    "key-command": Command,
    square: Square,
    "heat-grid": Grid3X3,
};

export type IconName = keyof typeof iconMap;

export interface IconProps {
    /** Blueprint-compatible icon name or a direct Lucide icon name */
    icon: IconName | string;
    /** Size in pixels (default: 16) */
    size?: number;
    /** Additional CSS class names */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** Color (defaults to currentColor) */
    color?: string;
    /** For accessibility - label for screen readers */
    "aria-label"?: string;
}

/**
 * Icon component that wraps Lucide icons with Blueprint-compatible API.
 * Provides a migration path from Blueprint icons to Lucide.
 */
export const Icon: React.FC<IconProps> = ({
    icon,
    size = 16,
    className = "",
    style,
    color,
    "aria-label": ariaLabel,
}) => {
    const LucideIcon = iconMap[icon];

    if (!LucideIcon) {
        // Development warning for unmapped icons
        if (process.env.NODE_ENV === "development") {
            console.warn(
                `[Icon] No Lucide mapping found for Blueprint icon "${icon}". Add it to src/components/ui/Icon.tsx`,
            );
        }
        // Render a placeholder
        return (
            <span
                className={`inline-flex items-center justify-center ${className}`}
                style={{ width: size, height: size, ...style }}
                role="img"
                aria-label={ariaLabel ?? icon}
            >
                ?
            </span>
        );
    }

    return (
        <LucideIcon
            size={size}
            className={className}
            style={style}
            color={color}
            aria-label={ariaLabel}
            aria-hidden={!ariaLabel}
        />
    );
};

export default Icon;

