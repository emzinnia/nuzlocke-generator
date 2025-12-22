import * as React from "react";
import { ErrorBoundary } from "components";

const Skeleton = (
    <div
        style={{ width: "100%", height: "100px" }}
        className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded"
    />
);

export function SuspenseBoundary({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={Skeleton}>{children}</React.Suspense>
        </ErrorBoundary>
    );
}
