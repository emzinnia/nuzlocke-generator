import * as React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "components/Layout/App/auth";
import { createRun, type RunSummary } from "api/runs";
import { PokemonEditor } from "components/Editors/PokemonEditor/PokemonEditor";
import { TrainerEditor } from "components/Editors/TrainerEditor/TrainerEditor";

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "sidebar-width";

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    requiresAuth?: boolean;
    isAuthenticated: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, requiresAuth, isAuthenticated }) => {
    if (requiresAuth && !isAuthenticated) {
        return (
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 dark:text-gray-500 cursor-not-allowed">
                {icon}
                <span>{label}</span>
                <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                    Login required
                </span>
            </div>
        );
    }

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
};

interface SidebarProps {
    runs: RunSummary[];
    isAuthenticated: boolean;
    onRunsChange: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ runs, isAuthenticated, onRunsChange }) => {
    const navigate = useNavigate();
    const { id: runId } = useParams<{ id: string }>();
    const [isCreating, setIsCreating] = React.useState(false);
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    });
    const [isResizing, setIsResizing] = React.useState(false);

    const logout = () => {
        localStorage.removeItem("auth_token");
        useAuthStore.setState({ token: null, isAuthenticated: false });
        navigate("/");
        onRunsChange();
    };

    const handleCreateRun = async () => {
        setIsCreating(true);
        try {
            const newRun = await createRun("My Nuzlocke Run");
            if (newRun) {
                onRunsChange();
                navigate(`/runs/${newRun.id}`);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem(STORAGE_KEY, width.toString());
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Prevent text selection while dragging
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isResizing, width]);

    return (
        <aside
            className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen relative flex-shrink-0 transition-colors"
            style={{ width }}
        >
            <div className="p-4 overflow-x-hidden">
                <nav className="space-y-1">
                    <NavItem
                        to="/"
                        label="Dashboard"
                        isAuthenticated={isAuthenticated}
                        icon={
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                    />
                    <NavItem
                        to="/api-explorer"
                        label="API Explorer"
                        requiresAuth
                        isAuthenticated={isAuthenticated}
                        icon={
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                    <NavItem
                        to="/data"
                        label="Data"
                        isAuthenticated={isAuthenticated}
                        icon={
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        }
                    />
                </nav>

                {/* My Saves section */}
                {isAuthenticated && (
                    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                My Saves
                            </div>
                            {runs.length > 0 ? (
                                runs.map((run) => (
                                    <NavLink
                                        key={run.id}
                                        to={`/runs/${run.id}`}
                                        className={({ isActive }) =>
                                            `block px-3 py-1.5 text-sm rounded-md transition-colors truncate ${
                                                isActive
                                                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`
                                        }
                                    >
                                        {run.name}
                                    </NavLink>
                                ))
                            ) : (
                                <div className="text-gray-400 dark:text-gray-500 italic text-xs px-3">
                                    No saves yet
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleCreateRun}
                            disabled={isCreating}
                            className="cursor-pointer w-full text-left px-3 py-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 rounded-md transition-colors flex items-center gap-2"
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
                        </button>
                    </div>
                )}

                {runId && <TrainerEditor runId={runId} onTrainerUpdated={onRunsChange} />}

                {runId && <PokemonEditor runId={runId} onPokemonAdded={onRunsChange} />}

                {/* Auth status section */}
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Logged in</span>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="truncate">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Not logged in</span>
                        </div>
                    )}
                </div>
        </div>

            {/* Resize handle */}
            <div
                onMouseDown={handleMouseDown}
                className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors ${
                    isResizing ? "bg-blue-500" : "bg-transparent"
                }`}
                title="Drag to resize"
            />
        </aside>
    );
};
