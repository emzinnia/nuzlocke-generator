import * as React from "react";
import { Button, ButtonGroup, Spinner, Select } from "components/ui";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { editorStyles } from "./styles";
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
import { HistoryPanel } from "./HistoryPanel";
import {
    reconstructPreviousState,
    reconstructNextState,
} from "reducers/editorHistory";
import { ErrorBoundary, HotkeyIndicator, ReleaseDialog } from "components/Common/Shared";
import { version } from "package";
import { getPatchlessVersion } from "utils";
import { css, cx } from "emotion";

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

const toolbarStyles = {
    container: css`
        position: sticky;
        top: -0.25rem;
        z-index: 12;
        width: 100%;
        padding: 0.25rem;
    `,
    row: css`
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        width: 100%;
        padding: 0.25rem;
    `,
    divider: css`
        width: 1px;
        background: rgba(128, 128, 128, 0.3);
        margin: 0 4px;
        align-self: stretch;
    `,
};

interface EditorToolbarProps {
    editorDarkMode: boolean;
    minimized: boolean;
}

export function EditorToolbar({ editorDarkMode, minimized }: EditorToolbarProps) {
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
    const prevDownloadRequested = React.useRef<number | null>(null);

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
        // On first run, store the initial value without triggering the spinner
        // This prevents the spinner from showing on page reload due to persisted state
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

    return (
        <div
            className={toolbarStyles.container}
            style={{
                background: editorDarkMode ? "#222" : "#fff",
                display: minimized ? "none" : "block",
            }}
        >
            {/* Primary row: History + Core actions */}
            <div className={toolbarStyles.row}>
                <ButtonGroup>
                    <Button
                        onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                        minimal
                        icon="history"
                        active={isHistoryPanelOpen}
                        title="View History"
                        data-testid="history-timeline-button"
                    >
                        <HotkeyIndicator
                            hotkey={customHotkeys?.toggleHistoryTimeline ?? "h"}
                            showModifier={false}
                        />
                    </Button>
                    <Button
                        disabled={!canUndo}
                        onClick={dispatchUndo}
                        minimal
                        icon="undo"
                        title="Undo"
                    >
                        <HotkeyIndicator hotkey="Z" />
                    </Button>
                    <Button
                        disabled={!canRedo}
                        onClick={dispatchRedo}
                        minimal
                        icon="redo"
                        title="Redo"
                    >
                        <HotkeyIndicator hotkey="Y" />
                    </Button>
                </ButtonGroup>

                <div className={toolbarStyles.divider} />

                <ButtonGroup>
                    <Button
                        data-testid="toggle-editor-size-button"
                        onClick={handleToggleMinimize}
                        minimal
                        icon={editor.minimized ? "minimize" : "maximize"}
                        title={editor.minimized ? "Maximize Editor" : "Minimize Editor"}
                    >
                        <HotkeyIndicator hotkey="M" showModifier={false} />
                    </Button>
                    <Button
                        data-testid="toggle-dark-mode-button"
                        onClick={handleToggleDarkMode}
                        minimal
                        icon={style.editorDarkMode ? "flash" : "moon"}
                        title={style.editorDarkMode ? "Light Mode" : "Dark Mode"}
                    >
                        <HotkeyIndicator hotkey="L" showModifier={false} />
                    </Button>
                </ButtonGroup>

                <div className={toolbarStyles.divider} />

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
                        >
                            <HotkeyIndicator hotkey="D" showModifier={false} />
                        </Button>
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

                <div className={toolbarStyles.divider} />

                <Button
                    data-testid="release-dialog-button"
                    onClick={() => setIsReleaseOpen(true)}
                    minimal
                    icon="star"
                    title={`Version ${version}`}
                >
                    <HotkeyIndicator hotkey="V" showModifier={false} />
                </Button>
            </div>

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
        </div>
    );
}

