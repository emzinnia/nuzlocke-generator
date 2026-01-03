import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, ButtonGroup, Spinner, Select, Icon } from "components/ui";
import { Intent } from "components/ui/intent";
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
import { SettingsDialog } from "components/Common/ui/SettingsDialog";
import { UpgradeAccountDialog } from "components/Common/ui/UpgradeAccountDialog";
import { version } from "package";
import { getPatchlessVersion } from "utils";
import { cx } from "emotion";
import { isMobile } from "is-mobile";
import type { RunSummary } from "api/runs";
import type { User } from "api/auth";

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

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors duration-150"
            style={({ isActive }) => ({
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--color-primary-500)" : "var(--color-text-primary)",
                backgroundColor: isActive ? "var(--color-primary-100)" : "transparent",
            })}
            onMouseEnter={(e) => {
                const link = e.currentTarget;
                if (link.getAttribute("aria-current") !== "page") {
                    link.style.backgroundColor = "var(--color-bg-tertiary)";
                }
            }}
            onMouseLeave={(e) => {
                const link = e.currentTarget;
                if (link.getAttribute("aria-current") !== "page") {
                    link.style.backgroundColor = "transparent";
                }
            }}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};

interface MainHeaderProps {
    runs: RunSummary[];
    isAuthenticated: boolean;
    user: User | null;
    onRunsChange: () => void;
}

export function MainHeader({ runs, isAuthenticated, user, onRunsChange }: MainHeaderProps) {
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
    const navigate = useNavigate();

    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState(false);
    const [isReleaseOpen, setIsReleaseOpen] = React.useState(
        !sawRelease?.[getPatchlessVersion(version) ?? 0],
    );
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = React.useState(false);
    const prevDownloadRequested = React.useRef<number | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isAnonymous = user?.is_anonymous ?? false;

    const editorDarkMode = style.editorDarkMode;
    const zoomLevel = editor.zoomLevel ?? 1;

    React.useEffect(() => {
        if (version.split(".")[2] !== "0") {
            dispatch(seeRelease(getPatchlessVersion(version)));
        }
    }, [dispatch]);

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

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

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
                "header w-full flex flex-wrap items-center gap-2 px-3 py-2",
                "border-b border-border bg-bg-primary",
                editorDarkMode && "dark",
            )}
            style={{ position: "relative", zIndex: 9999 }}
        >
            {/* Menu Button */}
            <div className="relative z-modal" ref={menuRef}>
                <Button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    minimal
                    className="p-2 h-auto w-auto"
                    aria-label="Menu"
                >
                    <Icon icon={isMenuOpen ? "cross" : "menu"} size={18} />
                </Button>

                {isMenuOpen && (
                    <div 
                        className="absolute left-0 mt-2 w-56 rounded-lg shadow-xl border"
                        style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderColor: "var(--color-border-default)",
                            zIndex: 9999,
                        }}
                    >
                        <div className="p-2 space-y-1">
                            <NavItem
                                to="/"
                                label="Editor"
                                onClick={() => setIsMenuOpen(false)}
                                icon={
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                }
                            />
                            <NavItem
                                to="/api-explorer"
                                label="API Explorer"
                                onClick={() => setIsMenuOpen(false)}
                                icon={
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                            <NavItem
                                to="/data"
                                label="Data"
                                onClick={() => setIsMenuOpen(false)}
                                icon={
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                }
                            />
                            <NavItem
                                to="/roadmap"
                                label="Roadmap"
                                onClick={() => setIsMenuOpen(false)}
                                icon={
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                }
                            />
                        </div>

                        {isAuthenticated && (
                            <div className="p-2 border-t" style={{ borderColor: "var(--color-border-default)" }}>
                                <div className="px-3 py-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                    Connected to backend
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-fg-primary tracking-tight">
                    Nuzlocke Generator
                </span>
                {isAuthenticated && isAnonymous && (
                    <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                            backgroundColor: "var(--color-warning-100)",
                            color: "var(--color-warning-700)",
                        }}
                    >
                        Guest
                    </span>
                )}
                {isAuthenticated && !isAnonymous && user?.email && (
                    <span
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{
                            backgroundColor: "var(--color-success-100)",
                            color: "var(--color-success-700)",
                        }}
                    >
                        {user.email}
                    </span>
                )}
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
                <div
                    className={cx(
                        "flex flex-wrap items-center gap-1 ml-auto",
                        mobile && "w-full mt-2 pt-2 border-t border-border"
                    )}
                >
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

                    <div className="w-px h-5 mx-1 bg-border" />

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

                    <div className="w-px h-5 mx-1 bg-border" />

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

                    <div className="w-px h-5 mx-1 bg-border" />

                    <ButtonGroup>
                        <Button
                            data-testid="settings-dialog-button"
                            onClick={() => setIsSettingsOpen(true)}
                            minimal
                            icon="cog"
                            title="Settings"
                            hotkey={{ key: ",", showModifier: true }}
                        />
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
                    </ButtonGroup>

                    {isAuthenticated && isAnonymous && (
                        <>
                            <div className="w-px h-5 mx-1 bg-border" />
                            <Button
                                data-testid="create-account-button"
                                onClick={() => setIsUpgradeDialogOpen(true)}
                                intent={Intent.PRIMARY}
                                icon="user"
                            >
                                <span className="hidden sm:inline">Create Account</span>
                            </Button>
                        </>
                    )}
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

            <ErrorBoundary>
                <SettingsDialog
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            </ErrorBoundary>

            <ErrorBoundary>
                <UpgradeAccountDialog
                    isOpen={isUpgradeDialogOpen}
                    onClose={() => setIsUpgradeDialogOpen(false)}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            </ErrorBoundary>
        </header>
    );
}

export default MainHeader;
