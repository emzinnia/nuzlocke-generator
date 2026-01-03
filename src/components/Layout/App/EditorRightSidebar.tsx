import * as React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { State } from "state";
import { fullGameData } from "utils/data/fullGameData";
import { Icon, Button } from "components/ui";
import { useHotkeyListener } from "hooks/useHotkeys";
import { cx } from "emotion";
import type { RunSummary } from "api/runs";
import { FullGameDataView } from "components/Common/ui/FullGameDataView";
import { ErrorBoundary } from "components/Common/Shared/ErrorBoundary";
import { addPokemon } from "actions";
import { generateEmptyPokemon } from "utils";

const MIN_WIDTH = 0;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 320;
const STORAGE_KEY = "local-right-sidebar-width";
const COLLAPSED_KEY = "local-right-sidebar-collapsed";

interface CollapsibleSectionProps {
    title: string;
    count?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    title, 
    count, 
    defaultOpen = false, 
    children 
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    return (
        <div className="bg-bg-tertiary rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-semibold text-fg-primary hover:bg-bg-overlay duration-fast transition-colors"
            >
                <span>{title}{count !== undefined ? ` (${count})` : ''}</span>
                <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size={14} />
            </button>
            {isOpen && (
                <div className="px-3 pb-3">
                    {children}
                </div>
            )}
        </div>
    );
};

interface EditorRightSidebarProps {
    isAuthenticated: boolean;
    runs: RunSummary[];
    onRunsChange?: () => void;
}

export const EditorRightSidebar: React.FC<EditorRightSidebarProps> = ({
    isAuthenticated,
    runs,
    onRunsChange,
}) => {
    const dispatch = useDispatch();
    const game = useSelector((state: State) => state.game);
    const pokemon = useSelector((state: State) => state.pokemon);
    
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        return localStorage.getItem(COLLAPSED_KEY) === "true";
    });
    const [width, setWidth] = React.useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
        return localStorage.getItem(COLLAPSED_KEY) === "true" ? 0 : parsed;
    });
    const [isResizing, setIsResizing] = React.useState(false);
    const lastWidthRef = React.useRef<number>(width || DEFAULT_WIDTH);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.min(
                MAX_WIDTH,
                Math.max(MIN_WIDTH, window.innerWidth - e.clientX)
            );
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem(STORAGE_KEY, width.toString());
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };
    }, [isResizing, width]);

    const handleCollapse = () => {
        lastWidthRef.current = width || DEFAULT_WIDTH;
        setIsCollapsed(true);
        setWidth(0);
        localStorage.setItem(COLLAPSED_KEY, "true");
    };

    const handleExpand = () => {
        setIsCollapsed(false);
        const nextWidth = lastWidthRef.current || DEFAULT_WIDTH;
        setWidth(nextWidth);
        localStorage.setItem(COLLAPSED_KEY, "false");
        localStorage.setItem(STORAGE_KEY, nextWidth.toString());
    };

    const handleToggle = React.useCallback(() => {
        if (isCollapsed) {
            handleExpand();
        } else {
            handleCollapse();
        }
    }, [isCollapsed]);

    useHotkeyListener('toggleRightSidebar', handleToggle);
    
    const totalPokemon = pokemon.length;
    const teamPokemon = pokemon.filter(p => p.status === "Team").length;
    const deadPokemon = pokemon.filter(p => p.status === "Dead").length;
    const boxedPokemon = pokemon.filter(p => p.status === "Boxed").length;

    const handleAddPokemon = React.useCallback(
        ({ species, status, met, level, metLevel }: {
            species: string;
            status: string;
            met: string;
            routeId: string;
            level?: number;
            metLevel?: number;
        }) => {
            const newPokemon = generateEmptyPokemon();
            newPokemon.species = species;
            newPokemon.nickname = species;
            newPokemon.status = status;
            newPokemon.met = met;
            if (level !== undefined) newPokemon.level = level;
            if (metLevel !== undefined) newPokemon.metLevel = metLevel;
            dispatch(addPokemon(newPokemon));
        },
        [dispatch]
    );

    if (isCollapsed) {
        return (
            <Button
                onClick={handleExpand}
                variant="outline"
                className="fixed top-20 right-0 z-fixed flex items-center justify-center w-6 h-8 !p-0 rounded-l bg-bg-secondary text-fg-primary border-border shadow-sm duration-fast transition-colors hover:bg-bg-tertiary"
                aria-label="Open right sidebar"
            >
                <Icon icon="chevron-left" size={16} />
            </Button>
        );
    }

    return (
        <aside
            className="h-full relative flex-shrink-0 flex flex-col overflow-hidden bg-bg-secondary text-fg-primary border-l border-border duration-normal transition-colors"
            style={{ width }}
        >
            <div className="absolute top-4 left-0 z-20">
                <Button
                    onClick={handleCollapse}
                    variant="outline"
                    className="w-6 h-8 !p-0 rounded-r flex items-center justify-center bg-bg-secondary text-fg-primary border-border shadow-sm"
                    aria-label="Collapse right sidebar"
                >
                    <Icon icon="chevron-right" size={16} />
                </Button>
            </div>
            
            <div className="overflow-x-hidden overflow-y-auto flex-1 pt-12 pb-4 pr-4 pl-6">
                <div className="space-y-3">
                    {/* Game Data (Routes & Bosses) */}
                    <ErrorBoundary errorMessage="Failed to load game data">
                        <FullGameDataView 
                            data={fullGameData} 
                            onAddPokemon={handleAddPokemon}
                            teamCount={teamPokemon}
                        />
                    </ErrorBoundary>

                    {/* Cloud Runs Section */}
                    {isAuthenticated && runs.length > 0 && (
                        <CollapsibleSection title="Cloud Runs" count={runs.length}>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {runs.slice(0, 5).map((run) => (
                                    <Link
                                        key={run.id}
                                        to={`/run/${run.slug}`}
                                        className="block p-2 rounded border border-border bg-bg-primary text-xs hover:border-primary-500/50 hover:bg-bg-tertiary transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{run.name}</span>
                                            <Icon icon="chevron-right" size={12} className="text-fg-tertiary" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {run.game_name && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary-500/20 text-primary-400">
                                                    {run.game_name}
                                                </span>
                                            )}
                                            <span className="text-fg-tertiary">
                                                {run.pokemon_count} Pokémon
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {runs.length > 5 && (
                                    <div className="text-center">
                                        <span className="text-[10px] text-fg-tertiary">
                                            +{runs.length - 5} more runs
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Quick Tips */}
                    <CollapsibleSection title="Quick Tips" defaultOpen={!isAuthenticated}>
                        <ul className="space-y-1 text-xs text-fg-secondary">
                            <li>• Press <kbd className="px-1 py-0.5 rounded-sm bg-bg-overlay text-[10px]">D</kbd> to download image</li>
                            <li>• Press <kbd className="px-1 py-0.5 rounded-sm bg-bg-overlay text-[10px]">N</kbd> to add Pokémon</li>
                            <li>• Drag & drop to reorder</li>
                            <li>• Click Pokémon icons to add from routes</li>
                        </ul>
                    </CollapsibleSection>

                    {/* Current Game Info */}
                    {game.name && (
                        <div className="bg-bg-tertiary rounded-lg p-3">
                            <h3 className="text-sm font-semibold text-fg-primary">
                                Game: {game.name}
                            </h3>
                        </div>
                    )}

                    {/* Run Stats */}
                    <div className="bg-bg-tertiary rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-fg-primary mb-2">
                            Run Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-fg-secondary">Total:</span>
                                <span className="font-medium">{totalPokemon}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-fg-secondary">Team:</span>
                                <span className="font-medium text-success-600">{teamPokemon}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-fg-secondary">Boxed:</span>
                                <span className="font-medium text-primary-600">{boxedPokemon}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-fg-secondary">Dead:</span>
                                <span className="font-medium text-danger-600">{deadPokemon}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                onMouseDown={handleMouseDown}
                className={cx(
                    "absolute top-0 left-0 w-1 h-full cursor-col-resize duration-fast transition-colors",
                    isResizing ? "bg-primary-500" : "bg-transparent hover:bg-primary-400"
                )}
                title="Drag to resize"
            />
        </aside>
    );
};

export default EditorRightSidebar;
