/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

interface ErrorBoundaryProps {
    errorMessage?: React.ReactNode;
    children?: any;
}

export const ErrorBoundary = ({
    errorMessage,
    children,
}: ErrorBoundaryProps) => {
    return (
        <ReactErrorBoundary
            fallback={
                <div className="error-boundary">
                    {errorMessage || "Something went wrong."}
                </div>
            }
        >
            {children}
        </ReactErrorBoundary>
    );
};
