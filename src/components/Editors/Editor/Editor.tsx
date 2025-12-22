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
const HotkeysEditor = React.lazy(() =>
    import("components/Editors/HotkeysEditor").then((res) => ({
        default: res.HotkeysEditor,
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
const EditorToolbar = React.lazy(() =>
    import("components/Editors/Editor/EditorToolbar").then((res) => ({
        default: res.EditorToolbar,
    })),
);
const Credits = React.lazy(() =>
    import("components/Features/Credits").then((res) => ({
        default: res.Credits,
    })),
);
const Result = React.lazy(() =>
    import("components/Features/Result/Result").then((res) => ({
        default: res.Result,
    })),
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
        return saved ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(saved, 10))) : DEFAULT_WIDTH;
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
            const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
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
            )}
            style={{
                width: minimized ? 0 : width,
                minWidth: minimized ? 0 : MIN_WIDTH,
                maxWidth: minimized ? 0 : MAX_WIDTH,
                background: editorDarkMode ? "#222" : "#fff",
                flexShrink: 0,
                position: "relative",
                overflow: minimized ? "hidden" : undefined,
                visibility: minimized ? "hidden" : "visible",
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
            >
                <Tab
                    id="nuzlocke"
                    title="Nuzlocke"
                    icon={<Icon icon="cube" />}
                    panel={
                        <div className="editor-tab-panel">
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
                        </div>
                    }
                />
                <Tab
                    id="style"
                    title="Style"
                    icon={<Icon icon="style" />}
                    panel={
                        <div className="editor-tab-panel">
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
                            <div className="editor-tab-panel result-tab-panel">
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
                        <div className="editor-tab-panel">
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
                        "editor-resize-handle",
                        isResizing && "resizing"
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
                <div className="editor-resize-overlay" />
            )}
        </div>
    );
}
