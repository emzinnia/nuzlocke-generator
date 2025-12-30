import * as React from "react";
import { Intent } from "./intent";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Intent for validation states */
    intent?: Intent;
    /** Fill available width */
    fill?: boolean;
    /** Large size */
    large?: boolean;
    /** Small size */
    small?: boolean;
    /** Enable auto-grow */
    growVertically?: boolean;
}

/**
 * TextArea component with Blueprint-compatible API.
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            intent = Intent.NONE,
            fill = false,
            large = false,
            small = false,
            growVertically = false,
            disabled = false,
            className = "",
            onChange,
            ...props
        },
        ref,
    ) => {
        const internalRef = React.useRef<HTMLTextAreaElement>(null);
        const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef;

        const intentBorderClass = {
            [Intent.NONE]: "border-border focus:border-primary-500",
            [Intent.PRIMARY]: "border-primary-500",
            [Intent.SUCCESS]: "border-success-500",
            [Intent.WARNING]: "border-warning-500",
            [Intent.DANGER]: "border-danger-500",
        };

        const sizeClass = small ? "text-xs py-1.5 px-2" : large ? "text-base py-3 px-4" : "text-sm py-2 px-3";

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (growVertically && combinedRef.current) {
                combinedRef.current.style.height = "auto";
                combinedRef.current.style.height = `${combinedRef.current.scrollHeight}px`;
            }
            onChange?.(e);
        };

        return (
            <textarea
                ref={combinedRef}
                disabled={disabled}
                onChange={handleChange}
                className={`rounded border bg-input outline-none transition-colors placeholder:text-fg-tertiary focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${intentBorderClass[intent]} ${sizeClass} ${fill ? "w-full" : ""} ${growVertically ? "resize-none overflow-hidden" : ""} ${className}`}
                {...props}
            />
        );
    },
);

TextArea.displayName = "TextArea";

export default TextArea;

