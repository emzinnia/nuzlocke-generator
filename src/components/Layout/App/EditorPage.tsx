import * as React from "react";
import { useOutletContext } from "react-router-dom";
import { ErrorBoundary, Skeleton } from "components";
import type { RunSummary } from "api/runs";

const Editor = React.lazy(() =>
    import("components/Editors/Editor").then((res) => ({
        default: res.Editor,
    }))
);

const ResultView = React.lazy(() =>
    import("components/Features/Result/ResultView").then((res) => ({
        default: res.ResultView,
    }))
);

const ImagesDrawer = React.lazy(() =>
    import("components/Common/Shared/ImagesDrawer").then((res) => ({
        default: res.ImagesDrawer,
    }))
);

const Hotkeys = React.lazy(() =>
    import("components/Features/Hotkeys").then((res) => ({
        default: res.Hotkeys,
    }))
);

const RightSidebar = React.lazy(() =>
    import("./EditorRightSidebar").then((res) => ({
        default: res.EditorRightSidebar,
    }))
);

interface EditorContext {
    runs: RunSummary[];
    isAuthenticated: boolean;
    onRunsChange: () => void;
}

export const EditorPage: React.FC = () => {
    const context = useOutletContext<EditorContext>();

    return (
        <>
            <ErrorBoundary key="hotkeys">
                <React.Suspense fallback={null}>
                    <Hotkeys />
                </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary key="editor">
                <React.Suspense fallback={Skeleton}>
                    <Editor />
                </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary key="result">
                <React.Suspense fallback={Skeleton}>
                    <ResultView />
                </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary key="right-sidebar">
                <React.Suspense fallback={Skeleton}>
                    <RightSidebar
                        isAuthenticated={context?.isAuthenticated ?? false}
                        runs={context?.runs ?? []}
                        onRunsChange={context?.onRunsChange}
                    />
                </React.Suspense>
            </ErrorBoundary>

            <ErrorBoundary key="images">
                <React.Suspense fallback={null}>
                    <ImagesDrawer />
                </React.Suspense>
            </ErrorBoundary>
        </>
    );
};

