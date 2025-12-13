import * as React from "react";
import { useSelector } from "react-redux";
import { cx } from "emotion";
import {} from "state";
import { ErrorBoundary, Skeleton } from "components";
import { editorStyles } from "./styles";
import "./editor.css";
import { editorModeSelector, minimizedSelector } from "selectors";

const PokemonEditor = React.lazy(() =>
    import("components/Editors/PokemonEditor").then((res) => ({
        default: res.PokemonEditor,
    })),
);
const NuzlockeSaveControls = React.lazy(() =>
    import("components/Editors/SavesEditor/NuzlockeSaveControls").then(
        (res) => ({
            default: res.NuzlockeSaveControls,
        }),
    ),
);
const GameEditor = React.lazy(() =>
    import("components/Editors/GameEditor").then((res) => ({
        default: res.GameEditor,
    })),
);
const TrainerEditor = React.lazy(() =>
    import("components/Editors/TrainerEditor").then((res) => ({
        default: res.TrainerEditor,
    })),
);
const BugReporter = React.lazy(() =>
    import("components/Features/BugReporter").then((res) => ({
        default: res.BugReporter,
    })),
);
const StatsEditor = React.lazy(() =>
    import("components/Editors/StatsEditor").then((res) => ({
        default: res.StatsEditor,
    })),
);
const StyleEditor = React.lazy(() =>
    import("components/Editors/StyleEditor").then((res) => ({
        default: res.StyleEditor,
    })),
);
const DataEditor = React.lazy(() =>
    import("components/Editors/DataEditor").then((res) => ({
        default: res.DataEditor,
    })),
);
const EditorControls = React.lazy(() =>
    import("components/Editors/Editor/EditorControls").then((res) => ({
        default: res.EditorControls,
    })),
);
const Credits = React.lazy(() =>
    import("components/Features/Credits").then((res) => ({
        default: res.Credits,
    })),
);

export function Editor() {
    const minimized = useSelector(minimizedSelector);
    const editorDarkMode = useSelector(editorModeSelector);

    return (
        <div
            className={cx(
                "editor",
                editorStyles.base,
                editorDarkMode ? "dark" : "",
            )}
            style={{
                width: minimized ? "0%" : "33%",
                marginLeft: minimized ? "-30rem" : "0",
                background: editorDarkMode ? "#222" : "#fff",
            }}
        >
            <ErrorBoundary key={1}>
                <React.Suspense fallback={Skeleton}>
                    <EditorControls
                        editorDarkMode={editorDarkMode}
                        minimized={minimized}
                    />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={2}>
                <React.Suspense fallback={Skeleton}>
                    <NuzlockeSaveControls />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={3}>
                <React.Suspense fallback={Skeleton}>
                    <GameEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={4}>
                <React.Suspense fallback={Skeleton}>
                    <DataEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={5}>
                <React.Suspense fallback={Skeleton}>
                    <TrainerEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={6}>
                <React.Suspense fallback={Skeleton}>
                    <PokemonEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={7}>
                <React.Suspense fallback={Skeleton}>
                    <StyleEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={8}>
                <React.Suspense fallback={Skeleton}>
                    <StatsEditor />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={10}>
                <React.Suspense fallback={Skeleton}>
                    <BugReporter />
                </React.Suspense>
            </ErrorBoundary>
            <ErrorBoundary key={11}>
                <React.Suspense fallback={Skeleton}>
                    <Credits />
                </React.Suspense>
            </ErrorBoundary>
        </div>
    );
}
