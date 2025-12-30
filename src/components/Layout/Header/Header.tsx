import * as React from "react";
import { Button, ButtonGroup, Spinner, Select } from "components/ui";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import {
    redoEditorHistory,
    syncStateFromHistory,
    undoEditorHistory,
    changeEditorSize,
    editStyle,
    seeRelease,
    triggerDownload,
    setZoomLevel,
} from "actions";
import { useEvent } from "utils/hooks";
import { HistoryPanel } from "components/Editors/Editor/HistoryPanel";
import {
    reconstructPreviousState,
    reconstructNextState,
} from "reducers/editorHistory";
import { ErrorBoundary, ReleaseDialog } from "components/Common/Shared";
import { version } from "package";
import { getPatchlessVersion } from "utils";
import { cx } from "emotion";
import { isMobile } from "is-mobile";

const ZoomValues = [
    { key: 0.25, value: "25%" },
    { key: 0.5, value: "50%" },
    { key: 0.75, value: "75%" },
    { key: 1, value: "100%" },
    { key: 1.25, value: "125%" },
    { key: 1.5, value: "150%" },
    { key: 2, value: "200%" },
    { key: 3, value: "300%" },
];

export function Header() {
    const editorHistory = useSelector<State, State["editorHistory"]>(
        (state) => state.editorHistory,
    );
    const customHotkeys = useSelector<State, State["hotkeys"]>(
        (state) => state.hotkeys,
    );
    const editor = useSelector<State, State["editor"]>((state) => state.editor);
    const style = useSelector<State, State["style"]>((state) => state.style);
    const sawRelease = useSelector<State, State["sawRelease"]>(
        (state) => state.sawRelease,
    );
    const dispatch = useDispatch();

    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = React.useState(
        !sawRelease?.[getPatchlessVersion(version) ?? 0],
    );
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const prevDownloadRequested = React.useRef<number | null>(null);

    const editorDarkMode = style.editorDarkMode;
    const zoomLevel = editor.zoomLevel ?? 1;

    // Mark release as seen on mount if it's a patch version
    React.useEffect(() => {
        if (version.split(".")[2] !== "0") {
            dispatch(seeRelease(getPatchlessVersion(version)));
        }
    }, [dispatch]);

    // Listen for download completion (reset after 5s)
    React.useEffect(() => {
        const downloadRequested = editor.downloadRequested ?? 0;
        if (prevDownloadRequested.current === null) {
            prevDownloadRequested.current = downloadRequested;
            return;
        }
        if (downloadRequested > 0 && downloadRequested !== prevDownloadRequested.current) {
            prevDownloadRequested.current = downloadRequested;
            setIsDownloading(true);
            const timeout = setTimeout(() => setIsDownloading(false), 5000);
            return () => clearTimeout(timeout);
        }
    }, [editor.downloadRequested]);

    const canUndo =
        editorHistory?.past?.length > 0 && editorHistory?.present != null;
    const canRedo =
        editorHistory?.future?.length > 0 && editorHistory?.present != null;

    const dispatchUndo = React.useCallback(() => {
        if (!canUndo) return;

        const { past, present } = editorHistory;
        const lastEntry = past[past.length - 1];

        const previousState = reconstructPreviousState(present, lastEntry);

        dispatch(undoEditorHistory());
        dispatch(syncStateFromHistory(previousState));
    }, [editorHistory, canUndo, dispatch]);

    const dispatchRedo = React.useCallback(() => {
        if (!canRedo) return;

        const { future, present } = editorHistory;
        const nextEntry = future[0];

        const nextState = reconstructNextState(present, nextEntry);

        dispatch(redoEditorHistory());
        dispatch(syncStateFromHistory(nextState));
    }, [editorHistory, canRedo, dispatch]);

    const handleUndo = React.useCallback(
        (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "z") {
                event.preventDefault();
                dispatchUndo();
            }
        },
        [dispatchUndo],
    );

    const handleRedo = React.useCallback(
        (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                (event.key === "y" || event.key === "z")
            ) {
                event.preventDefault();
                dispatchRedo();
            }
        },
        [dispatchRedo],
    );

    useEvent("keydown", handleUndo);
    useEvent("keydown", handleRedo);

    const handleDownload = React.useCallback(() => {
        dispatch(triggerDownload());
    }, [dispatch]);

    const handleToggleMinimize = React.useCallback(() => {
        dispatch(changeEditorSize(!editor.minimized));
    }, [dispatch, editor.minimized]);

    const handleToggleDarkMode = React.useCallback(() => {
        dispatch(editStyle({ editorDarkMode: !style.editorDarkMode }));
    }, [dispatch, style.editorDarkMode]);

    const handleZoomChange = React.useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            dispatch(setZoomLevel(Number(event.target.value)));
        },
        [dispatch],
    );

    const handleReleaseClose = React.useCallback(() => {
        dispatch(seeRelease(getPatchlessVersion(version)));
        setIsReleaseOpen(false);
    }, [dispatch]);

    const zoomOptions = ZoomValues.map(({ key, value }) => ({
        value: String(key),
        label: value,
    }));

    const mobile = isMobile();
    const shouldShowControls = mobile ? isMobileMenuOpen : true;

    return (
        <header
            className={cx(
                "header",
                "w-full relative",
                "flex flex-wrap items-center gap-2 px-3 py-2",
                "border-b border-[var(--color-border-default)]",
                "bg-[var(--color-bg-primary)]",
                "z-[var(--z-sticky)]",
                editorDarkMode && "dark",
            )}
        >
            <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--color-text-primary)] text-sm tracking-tight">
                    Nuzlocke Generator
                </span>
                {mobile && (
                    <Button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        minimal
                        icon={isMobileMenuOpen ? "cross" : "menu"}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    />
                )}
            </div>

            {shouldShowControls && (
                <div className={cx(
                    "flex flex-wrap items-center gap-1",
                    mobile && "w-full mt-2 border-t border-[var(--color-border-default)] pt-2"
                )}>
                    <ButtonGroup>
                        <Button
                            onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                            minimal
                            icon="history"
                            active={isHistoryPanelOpen}
                            title="View History"
                            data-testid="history-timeline-button"
                            hotkey={{ key: customHotkeys?.toggleHistoryTimeline ?? "h", showModifier: false }}
                        />
                        <Button
                            disabled={!canUndo}
                            onClick={dispatchUndo}
                            minimal
                            icon="undo"
                            title="Undo"
                            hotkey={{ key: "Z" }}
                        />
                        <Button
                            disabled={!canRedo}
                            onClick={dispatchRedo}
                            minimal
                            icon="redo"
                            title="Redo"
                            hotkey={{ key: "Y" }}
                        />
                    </ButtonGroup>

                    <div className="w-px h-5 bg-[var(--color-border-default)] mx-1" />

                    <ButtonGroup>
                        <Button
                            data-testid="toggle-editor-size-button"
                            onClick={handleToggleMinimize}
                            minimal
                            icon={editor.minimized ? "minimize" : "maximize"}
                            title={editor.minimized ? "Maximize Editor" : "Minimize Editor"}
                            hotkey={{ key: "Shift+M", showModifier: false }}
                        />
                        <Button
                            data-testid="toggle-dark-mode-button"
                            onClick={handleToggleDarkMode}
                            minimal
                            icon={style.editorDarkMode ? "flash" : "moon"}
                            title={style.editorDarkMode ? "Light Mode" : "Dark Mode"}
                            hotkey={{ key: "Shift+L", showModifier: false }}
                        />
                    </ButtonGroup>

                    <div className="w-px h-5 bg-[var(--color-border-default)] mx-1" />

                    <ButtonGroup>
                        {isDownloading ? (
                            <Button minimal disabled>
                                <Spinner className="inline-flex" size={16} />
                            </Button>
                        ) : (
                            <Button
                                data-testid="download-image-button"
                                onClick={handleDownload}
                                minimal
                                icon="download"
                                title="Download Image"
                                hotkey={{ key: "D", showModifier: false }}
                            />
                        )}
                        <Select
                            className={cx("zoom-select", { dark: editorDarkMode })}
                            value={String(zoomLevel)}
                            onChange={handleZoomChange}
                            options={zoomOptions}
                            minimal
                            style={{ minWidth: "60px" }}
                        />
                    </ButtonGroup>

                    <div className="w-px h-5 bg-[var(--color-border-default)] mx-1" />

                    <Button
                        data-testid="release-dialog-button"
                        onClick={() => setIsReleaseOpen(true)}
                        minimal
                        icon="star"
                        title={`Version ${version}`}
                        hotkey={{ key: "V", showModifier: false }}
                    >
                        <span className="hidden sm:inline">{version}</span>
                    </Button>
                </div>
            )}

            <HistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                editorDarkMode={editorDarkMode}
            />

            <ErrorBoundary>
                <ReleaseDialog
                    style={style}
                    isOpen={isReleaseOpen}
                    onClose={handleReleaseClose}
                />
            </ErrorBoundary>
        </header>
    );
}

