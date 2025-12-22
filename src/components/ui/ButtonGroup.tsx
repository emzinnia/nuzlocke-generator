import * as React from "react";

export interface ButtonGroupProps {
    /** Child buttons */
    children: React.ReactNode;
    /** Arrange buttons vertically */
    vertical?: boolean;
    /** Fill available width */
    fill?: boolean;
    /** Minimal style for all buttons */
    minimal?: boolean;
    /** Large size for all buttons */
    large?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * ButtonGroup component for grouping related buttons.
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
    children,
    vertical = false,
    fill = false,
    className = "",
}) => {
    const baseClasses = [
        "inline-flex",
        vertical ? "flex-col" : "flex-row",
        fill ? "w-full" : "",
        // Remove rounded corners from middle buttons
        "[&>*:not(:first-child):not(:last-child)]:rounded-none",
        vertical
            ? "[&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none"
            : "[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none",
        // Add border overlap for connected look
        vertical
            ? "[&>*:not(:first-child)]:-mt-px"
            : "[&>*:not(:first-child)]:-ml-px",
        className,
    ].join(" ");

    return <div className={baseClasses}>{children}</div>;
};

export default ButtonGroup;

