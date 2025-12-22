import * as React from "react";
import { Loader2 } from "lucide-react";
import { Intent, intentToTextClass } from "./intent";

export interface SpinnerProps {
    /** Size in pixels */
    size?: number;
    /** Intent color */
    intent?: Intent;
    /** Additional className */
    className?: string;
}

/**
 * Spinner component for loading states.
 */
export const Spinner: React.FC<SpinnerProps> = ({
    size = 16,
    intent = Intent.NONE,
    className = "",
}) => {
    return (
        <Loader2
            size={size}
            className={`animate-spin ${intentToTextClass[intent]} ${className}`}
            aria-label="Loading"
        />
    );
};

export default Spinner;

