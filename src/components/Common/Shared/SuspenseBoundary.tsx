import * as React from "react";
import { ErrorBoundary } from "components";

const Skeleteon = (
    <div
        style={{ width: "100%", height: "100px" }}
        className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
    ></div>
);

export function SuspenseBoundary({
    children,
}: {
    children?: React.LazyExoticComponent<() => JSX.Element>;
}) {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={Skeleteon}>{children}</React.Suspense>
        </ErrorBoundary>
    );
}
