import * as React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { createRun, getRun, restoreRunState, type RunSummary } from "api/runs";
import { useUndoRedoStore } from "hooks/useUndoRedo";
import { useAuthStore } from "components/Layout/App/auth";
import { Keyboard } from "./Keyboard";
import { Settings } from "lucide-react";
import { Button } from "./Button";
import { SettingsDialog } from "./SettingsDialog";

interface HeaderProps {
    runs: RunSummary[];
    isAuthenticated: boolean;
    onRunsChange: () => void;
}

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    requiresAuth?: boolean;
    isAuthenticated: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, requiresAuth, isAuthenticated, onClick }) => {
    if (requiresAuth && !isAuthenticated) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                {icon}
                <span>{label}</span>
            </div>
        );
    }

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                        ? "bg-primary/20 text-primary font-medium"
                        : "text-foreground hover:bg-accent"
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};

export const Header: React.FC<HeaderProps> = ({ runs, isAuthenticated, onRunsChange }) => {
    const { isDark, toggle } = useDarkMode();
    const navigate = useNavigate();
    const { id: runId } = useParams<{ id: string }>();
    const [isCreating, setIsCreating] = React.useState(false);
    const [isUndoing, setIsUndoing] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const undoRedoStore = useUndoRedoStore();
    const canUndo = runId ? undoRedoStore.canUndo(runId) : false;
    const canRedo = runId ? undoRedoStore.canRedo(runId) : false;

    const handleCreateRun = async () => {
        setIsCreating(true);
        try {
            const newRun = await createRun("My Nuzlocke Run");
            if (newRun) {
                onRunsChange();
                navigate(`/runs/${newRun.id}`);
                setIsDropdownOpen(false);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        useAuthStore.setState({ token: null, isAuthenticated: false });
        navigate("/");
        onRunsChange();
        setIsMenuOpen(false);
    };

    const handleUndo = React.useCallback(async () => {
        if (!runId || !canUndo || isUndoing) return;
        
        setIsUndoing(true);
        try {
            const currentRun = await getRun(runId);
            const previousState = undoRedoStore.undo(runId, currentRun.data);
            
            if (previousState) {
                await restoreRunState(runId, previousState);
                onRunsChange();
            }
        } catch (err) {
            console.error('Undo failed:', err);
        } finally {
            setIsUndoing(false);
        }
    }, [runId, canUndo, isUndoing, undoRedoStore, onRunsChange]);

    const handleRedo = React.useCallback(async () => {
        if (!runId || !canRedo || isUndoing) return;
        
        setIsUndoing(true);
        try {
            const currentRun = await getRun(runId);
            const nextState = undoRedoStore.redo(runId, currentRun.data);
            
            if (nextState) {
                await restoreRunState(runId, nextState);
                onRunsChange();
            }
        } catch (err) {
            console.error('Redo failed:', err);
        } finally {
            setIsUndoing(false);
        }
    }, [runId, canRedo, isUndoing, undoRedoStore, onRunsChange]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!runId) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [runId, handleUndo, handleRedo]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isDropdownOpen || isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, isMenuOpen]);

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
    };

    return (
        <header className="bg-background border-b border-border transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={menuRef}>
                            <Button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                variant="ghost"
                                className="p-2 h-auto w-auto rounded-md text-foreground hover:bg-accent transition-colors"
                                aria-label="Menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </Button>

                            {isMenuOpen && (
                                <div className="absolute left-0 mt-2 w-56 bg-popover text-popover-foreground rounded-md shadow-lg border border-border z-50">
                                    <div className="p-2 space-y-1">
                                        <NavItem
                                            to="/"
                                            label="Dashboard"
                                            isAuthenticated={isAuthenticated}
                                            onClick={() => setIsMenuOpen(false)}
                                            icon={
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            }
                                        />
                                        <NavItem
                                            to="/api-explorer"
                                            label="API Explorer"
                                            requiresAuth
                                            isAuthenticated={isAuthenticated}
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
                                            isAuthenticated={isAuthenticated}
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
                                            requiresAuth
                                            isAuthenticated={isAuthenticated}
                                            onClick={() => setIsMenuOpen(false)}
                                            icon={
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            }
                                        />
                                    </div>

                                    <div className="border-t border-border p-2">
                                        {isAuthenticated ? (
                                            <Button
                                                onClick={logout}
                                                variant="ghost"
                                                className="w-full justify-start text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span>Not logged in</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0 font-semibold text-foreground">
                            Nuzlocke Generator
                        </div>
                        {isAuthenticated && (
                            <div className="relative" ref={dropdownRef}>
                                <Button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    variant="ghost"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                    <span>My Saves</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Button>

                                {isDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-64 bg-popover text-popover-foreground rounded-md shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
                                        <div className="p-2 space-y-1">
                                            {runs.length > 0 ? (
                                                runs.map((run) => (
                                                    <NavLink
                                                        key={run.id}
                                                        to={`/runs/${run.id}`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className={({ isActive }) =>
                                                            `block px-3 py-2 text-sm rounded-md transition-colors truncate ${
                                                                isActive
                                                                    ? "bg-primary/20 text-primary font-medium"
                                                                    : "text-foreground hover:bg-accent"
                                                            }`
                                                        }
                                                    >
                                                        {run.name}
                                                    </NavLink>
                                                ))
                                            ) : (
                                                <div className="text-muted-foreground italic text-xs px-3 py-2">
                                                    No saves yet
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-border p-2">
                                            <Button
                                                onClick={handleCreateRun}
                                                disabled={isCreating}
                                                variant="ghost"
                                                className="w-full justify-start text-left px-3 py-2 text-sm text-primary hover:bg-primary/10 disabled:opacity-50 rounded-md transition-colors flex items-center gap-2"
                                            >
                                                {isCreating ? (
                                                    <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                )}
                                                <span className="truncate">{isCreating ? "Creating..." : "New Nuzlocke Run"}</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {runId && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleUndo}
                                    disabled={!canUndo || isUndoing}
                                    title="Undo (Ctrl+Z)"
                                    variant="secondary"
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-secondary text-secondary-foreground hover:bg-accent"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
                                    </svg>
                                    <span>Undo</span>
                                    <Keyboard shortcut="⌘Z" />
                                </Button>
                                <Button
                                    onClick={handleRedo}
                                    disabled={!canRedo || isUndoing}
                                    title="Redo (Ctrl+Shift+Z)"
                                    variant="secondary"
                                    className="flex flex-row-reverse items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-secondary text-secondary-foreground hover:bg-accent"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a5 5 0 00-5 5v2M21 10l-4-4m4 4l-4 4" />
                                    </svg>
                                    <span>Redo</span>
                                    <Keyboard shortcut="⌘⇧Z" />
                                </Button>
                            </div>
                        )}

                        <Button
                            onClick={toggle}
                            variant="ghost"
                            className="p-2 h-auto w-auto rounded-lg bg-secondary hover:bg-accent transition-colors"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? (
                                <svg
                                    className="w-5 h-5 text-yellow-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 text-foreground"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </Button>
                        <Button
                            onClick={handleOpenSettings}
                            variant="ghost"
                            className="p-2 h-auto w-auto rounded-lg bg-secondary hover:bg-accent transition-colors"
                            title="Settings"
                            aria-label="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <SettingsDialog isOpen={isSettingsOpen} onClose={closeSettings} />
        </header>
    );
};
