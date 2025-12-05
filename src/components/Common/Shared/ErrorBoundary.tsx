import * as React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

interface ErrorBoundaryProps {
    errorMessage?: React.ReactNode;
    children?: React.ReactNode;
}

export const ErrorBoundary = ({
    errorMessage,
    children,
}: ErrorBoundaryProps) => {
    return (
        <ReactErrorBoundary
            fallbackRender={({ error }) => (
                <div className="p-4 text-center text-red-600 dark:text-red-400">
                    {errorMessage || "Ooops. Something failed..."}
                </div>
            )}
        >
            {children}
        </ReactErrorBoundary>
    );
};
