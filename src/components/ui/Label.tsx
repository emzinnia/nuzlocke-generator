import * as React from "react";

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** Whether to display inline (default) or block */
    inline?: boolean;
    /** Disabled appearance */
    disabled?: boolean;
    /** Required indicator */
    required?: boolean;
    /** Helper text below label */
    helperText?: React.ReactNode;
}

/**
 * Label component for form controls.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    (
        {
            inline = true,
            disabled = false,
            required = false,
            helperText,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <label
                ref={ref}
                className={`
                    ${inline ? "inline-flex items-center" : "flex flex-col"}
                    gap-1
                    text-sm
                    font-medium
                    text-fg-secondary
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${className}
                `
                    .trim()
                    .replace(/\s+/g, " ")}
                {...props}
            >
                <span>
                    {children}
                    {required && (
                        <span
                            className="ml-0.5 text-danger-500"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )}
                </span>
                {helperText && (
                    <span className="text-xs font-normal text-fg-tertiary">
                        {helperText}
                    </span>
                )}
            </label>
        );
    }
);

Label.displayName = "Label";

export default Label;
