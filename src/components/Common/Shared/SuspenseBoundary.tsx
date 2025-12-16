import * as React from "react";
import { ErrorBoundary } from "components";
import { Classes } from "@blueprintjs/core";

const Skeleteon = (
    <div
        style={{ width: "100%", height: "100px" }}
        className={Classes.SKELETON}
    ></div>
);

export function SuspenseBoundary({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <React.Suspense fallback={Skeleteon}>{children}</React.Suspense>
        </ErrorBoundary>
    );
}
