import * as React from "react";

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export interface HotkeyIndicatorProps {
    /** The key to display (e.g., "Z", "Y", "S") */
    hotkey: string;
    /** Whether to show the modifier key (Cmd/Ctrl). Defaults to true */
    showModifier?: boolean;
    /** Custom modifier to use instead of the platform default */
    modifier?: string;
    /** Additional CSS styles */
    style?: React.CSSProperties;
    /** Additional CSS class name */
    className?: string;
}

const defaultStyle: React.CSSProperties = {
    opacity: 0.6,
    fontFamily: "inherit",
    fontSize: "0.625rem",
    border: "1px solid rgba(0, 0, 0, 0.3)",
    padding: "0.125rem 0.25rem",
};

/**
 * A component that displays a keyboard shortcut indicator.
 * Automatically shows the correct modifier key (⌘ for Mac, Ctrl+ for Windows/Linux).
 */
export function HotkeyIndicator({
    hotkey,
    showModifier = true,
    modifier,
    style,
    className,
}: HotkeyIndicatorProps) {
    const modKey = modifier ?? (isMac ? "⌘" : "Ctrl+");
    const displayText = showModifier ? `${modKey}${hotkey}` : hotkey;

    return (
        <kbd
            className={className}
            style={{ ...defaultStyle, ...style }}
        >
            {displayText}
        </kbd>
    );
}

