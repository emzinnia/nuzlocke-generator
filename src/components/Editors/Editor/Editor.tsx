import * as React from "react";
import { useSelector } from "react-redux";
import { cx } from "emotion";
import { isMobile } from "is-mobile";
import { ErrorBoundary, Skeleton } from "components";
import { editorStyles } from "./styles";
import "./editor.css";
import { editorModeSelector, minimizedSelector } from "selectors";
import { Tabs, Tab, Icon } from "components/ui";

const PokemonEditor = React.lazy(() =>
    import("components/Editors/PokemonEditor").then((res) => ({
        default: res.PokemonEditor,
    }))
);
const NuzlockeSaveControls = React.lazy(() =>
    import("components/Editors/SavesEditor/NuzlockeSaveControls").then(
        (res) => ({
            default: res.NuzlockeSaveControls,
        })
    )
);
const GameEditor = React.lazy(() =>
    import("components/Editors/GameEditor").then((res) => ({
        default: res.GameEditor,
    }))
);
const TrainerEditor = React.lazy(() =>
    import("components/Editors/TrainerEditor").then((res) => ({
        default: res.TrainerEditor,
    }))
);
const HotkeysEditor = React.lazy(() =>
    import("components/Editors/HotkeysEditor").then((res) => ({
        default: res.HotkeysEditor,
    }))
);
const BugReporter = React.lazy(() =>
    import("components/Features/BugReporter").then((res) => ({
        default: res.BugReporter,
    }))
);
const StatsEditor = React.lazy(() =>
    import("components/Editors/StatsEditor").then((res) => ({
        default: res.StatsEditor,
    }))
);
const StyleEditor = React.lazy(() =>
    import("components/Editors/StyleEditor").then((res) => ({
        default: res.StyleEditor,
    }))
);
const DataEditor = React.lazy(() =>
    import("components/Editors/DataEditor").then((res) => ({
        default: res.DataEditor,
    }))
);
const EditorToolbar = React.lazy(() =>
    import("components/Editors/Editor/EditorToolbar").then((res) => ({
        default: res.EditorToolbar,
    }))
);
const Credits = React.lazy(() =>
    import("components/Features/Credits").then((res) => ({
        default: res.Credits,
    }))
);
const Result = React.lazy(() =>
    import("components/Features/Result/Result").then((res) => ({
        default: res.Result,
    }))
);

const MIN_WIDTH = 320; // px
const MAX_WIDTH = 800; // px
const DEFAULT_WIDTH = 480; // px

/**
 * The main editor interface.
 */
export function Editor() {
    const minimized = useSelector(minimizedSelector);
    const editorDarkMode = useSelector(editorModeSelector);

    const [width, setWidth] = React.useState(() => {
        // Restore saved width from localStorage
        const saved = localStorage.getItem("editor-sidebar-width");
        return saved
            ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(saved, 10)))
            : DEFAULT_WIDTH;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const sidebarRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(
                MIN_WIDTH,
                Math.min(MAX_WIDTH, e.clientX)
            );
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            // Save to localStorage
            localStorage.setItem("editor-sidebar-width", String(width));
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Add cursor style to body during resize
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, width]);

    return (
        <div
            ref={sidebarRef}
            className={cx(
                "editor",
                editorStyles.base,
                editorDarkMode ? "dark" : "",
                // Tailwind classes for editor styling
                "min-h-screen p-1 relative overflow-y-auto overflow-x-hidden",
                "border border-[var(--color-border-default)] border-r-0",
                "bg-[var(--color-bg-primary)]",
                "hover:shadow-[0_0_4px_var(--color-border-default)]"
            )}
            style={{
                width: minimized ? 0 : width,
                minWidth: minimized ? 0 : MIN_WIDTH,
                maxWidth: minimized ? 0 : MAX_WIDTH,
                flexShrink: 0,
                position: "relative",
                overflow: minimized ? "hidden" : undefined,
                visibility: minimized ? "hidden" : "visible",
                clipPath: "inset(0 -20px 0 0)", // Allow resize handle to show outside
            }}
        >
            <ErrorBoundary key={1}>
                <React.Suspense fallback={Skeleton}>
                    <EditorToolbar
                        editorDarkMode={editorDarkMode}
                        minimized={minimized}
                    />
                </React.Suspense>
            </ErrorBoundary>

            <Tabs
                id="editor-tabs"
                defaultSelectedTabId="nuzlocke"
                fill
                className="mt-1 [&_[role=tablist]]:px-1 [&_[role=tablist]]:gap-1 [&_[role=tablist]]:border-b-gray-200 dark:[&_[role=tablist]]:border-b-gray-700 [&_[role=tab]]:px-3 [&_[role=tab]]:py-2 [&_[role=tab]]:text-[0.8125rem] [&_[role=tab]]:rounded-t [&_[role=tab]]:bg-transparent [&_[role=tab]]:transition-colors [&_[role=tab]:hover]:bg-black/5 dark:[&_[role=tab]:hover]:bg-white/5 [&_[role=tab][aria-selected=true]]:bg-blue-500/10 dark:[&_[role=tab][aria-selected=true]]:bg-blue-500/15"
            >
                <Tab
                    id="data"
                    title="Data"
                    icon={<Icon icon="database" />}
                    panel={
                        <div className="pt-1 pb-8">
                            <ErrorBoundary key={2}>
                                <React.Suspense fallback={Skeleton}>
                                    <NuzlockeSaveControls />
                                </React.Suspense>
                            </ErrorBoundary>
                            <ErrorBoundary key={4}>
                                <React.Suspense fallback={Skeleton}>
                                    <DataEditor />
                                </React.Suspense>
                            </ErrorBoundary>
                        </div>
                    }
                />
                <Tab
                    id="nuzlocke"
                    title="Nuzlocke"
                    icon={<Icon icon="cube" />}
                    panel={
                        <div className="pt-1">
                            <ErrorBoundary key={3}>
                                <React.Suspense fallback={Skeleton}>
                                    <GameEditor />
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
                        </div>
                    }
                />
                <Tab
                    id="style"
                    title="Style"
                    icon={<Icon icon="style" />}
                    panel={
                        <div className="pt-1">
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
                        </div>
                    }
                />
                {isMobile() && (
                    <Tab
                        id="result"
                        title="Result"
                        icon={<Icon icon="media" />}
                        panel={
                            <div className="pt-1 p-0 overflow-auto max-sm:[&_.result]:mx-auto max-sm:[&_.result]:origin-top-center">
                                <ErrorBoundary key={12}>
                                    <React.Suspense fallback={Skeleton}>
                                        <Result />
                                    </React.Suspense>
                                </ErrorBoundary>
                            </div>
                        }
                    />
                )}
                <Tab
                    id="settings"
                    title="Settings"
                    icon={<Icon icon="cog" />}
                    panel={
                        <div className="pt-1">
                            <ErrorBoundary key={9}>
                                <React.Suspense fallback={Skeleton}>
                                    <HotkeysEditor />
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
                    }
                />
            </Tabs>

            {/* Resize handle */}
            {!minimized && (
                <div
                    onMouseDown={handleMouseDown}
                    className={cx(
                        // Resize handle positioning and interaction
                        "absolute top-0 -right-3 w-3 h-full cursor-ew-resize z-[100]",
                        "flex items-center justify-center touch-none bg-transparent",
                        // Before pseudo-element for visual handle
                        "before:content-[''] before:w-1 before:h-full before:rounded-sm before:transition-all before:duration-150",
                        "before:bg-gray-300 dark:before:bg-gray-600",
                        "hover:before:bg-blue-500 hover:before:w-[5px] hover:before:shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                        "dark:hover:before:bg-blue-400 dark:hover:before:shadow-[0_0_8px_rgba(96,165,250,0.4)]",
                        isResizing &&
                            "before:bg-blue-600 before:w-[5px] before:shadow-[0_0_12px_rgba(59,130,246,0.6)] dark:before:bg-blue-500"
                    )}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize sidebar"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") {
                            setWidth((w) => Math.max(MIN_WIDTH, w - 20));
                        } else if (e.key === "ArrowRight") {
                            setWidth((w) => Math.min(MAX_WIDTH, w + 20));
                        }
                    }}
                />
            )}

            {/* Overlay to capture mouse events during resize and prevent them from hitting other components */}
            {isResizing && (
                <div className="fixed inset-0 z-[9999] cursor-ew-resize" />
            )}
        </div>
    );
}
