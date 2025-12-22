import * as React from "react";

export type Elevation = 0 | 1 | 2 | 3 | 4;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Elevation level (shadow depth) */
    elevation?: Elevation;
    /** Interactive (hoverable) */
    interactive?: boolean;
    /** Additional className */
    className?: string;
    /** Children */
    children: React.ReactNode;
}

/**
 * Card component for content containers.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ elevation = 1, interactive = false, className = "", children, ...props }, ref) => {
        const elevationClass = {
            0: "",
            1: "shadow-sm",
            2: "shadow",
            3: "shadow-lg",
            4: "shadow-xl",
        };

        return (
            <div
                ref={ref}
                className={`rounded-lg border border-card-border bg-card-bg p-4 ${elevationClass[elevation]} ${interactive ? "cursor-pointer transition-shadow hover:shadow-lg" : ""} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    },
);

Card.displayName = "Card";

export default Card;

