import * as React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { State } from "state";
import { fullGameData } from "utils/data/fullGameData";
import { Icon, Button } from "components/ui";
import { useHotkeyListener } from "hooks/useHotkeys";
import { addPokemon } from "actions";
import { generateEmptyPokemon, normalizeSpeciesName } from "utils";
import { cx } from "emotion";
import type { RunSummary } from "api/runs";

const MIN_WIDTH = 0;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 320;
const STORAGE_KEY = "local-right-sidebar-width";
const COLLAPSED_KEY = "local-right-sidebar-collapsed";

const STATUS_OPTIONS = ["Team", "Boxed", "Dead", "Champs", "Missed"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const SimplePokemonIcon: React.FC<{ species: string; size?: number }> = ({ species, size = 32 }) => {
    const normalizedName = normalizeSpeciesName(species);
    const src = `/icons/pokemon/regular/${normalizedName}.png`;
    
    return (
        <img 
            src={src}
            alt={species}
            title={species}
            width={size}
            height={size}
            className="[image-rendering:pixelated]"
            onError={(e) => {
                (e.target as HTMLImageElement).src = "/icons/pokemon/unknown.png";
            }}
        />
    );
};

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
    const [completedRoutes, setCompletedRoutes] = React.useState<Set<string>>(new Set());
    const [skippedRoutes, setSkippedRoutes] = React.useState<Set<string>>(new Set());
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

    const handleAddPokemon = React.useCallback((species: string, status: StatusOption, met: string, routeId: string) => {
        const newPokemon = generateEmptyPokemon();
        newPokemon.species = species;
        newPokemon.nickname = species;
        newPokemon.status = status;
        newPokemon.met = met;
        dispatch(addPokemon(newPokemon));
        setCompletedRoutes(prev => new Set([...prev, routeId]));
        setSkippedRoutes(prev => {
            const next = new Set(prev);
            next.delete(routeId);
            return next;
        });
    }, [dispatch]);

    const handleSkipRoute = React.useCallback((routeId: string) => {
        setSkippedRoutes(prev => {
            const next = new Set(prev);
            if (next.has(routeId)) {
                next.delete(routeId);
            } else {
                next.add(routeId);
            }
            return next;
        });
        setCompletedRoutes(prev => {
            const next = new Set(prev);
            next.delete(routeId);
            return next;
        });
    }, []);

    const routes = fullGameData.routes || [];
    const bosses = fullGameData.bosses || [];
    
    const totalPokemon = pokemon.length;
    const teamPokemon = pokemon.filter(p => p.status === "Team").length;
    const deadPokemon = pokemon.filter(p => p.status === "Dead").length;
    const boxedPokemon = pokemon.filter(p => p.status === "Boxed").length;

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

                    {/* Current Game Info */}
                    {game.name && (
                        <div className="bg-bg-tertiary rounded-lg p-3">
                            <h3 className="text-sm font-semibold text-fg-primary">
                                Game: {game.name}
                            </h3>
                        </div>
                    )}

                    {/* Routes Section */}
                    {routes.length > 0 && (
                        <CollapsibleSection title="Routes" count={routes.length} defaultOpen>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {routes.map((route) => {
                                    const isCompleted = completedRoutes.has(route.id);
                                    const isSkipped = skippedRoutes.has(route.id);
                                    const hasEncounters = route.pokemonMap.length > 0;
                                    
                                    return (
                                        <div 
                                            key={route.id}
                                            className={cx(
                                                "p-2 rounded border text-xs transition-colors",
                                                isSkipped && "border-border-muted bg-bg-overlay opacity-60",
                                                isCompleted && "border-success-500 bg-success-50",
                                                !isSkipped && !isCompleted && "border-border bg-bg-primary"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{route.routeName}</span>
                                                <div className="flex items-center gap-1">
                                                    {isCompleted && <span className="text-success-600">✓</span>}
                                                    {!isCompleted && (
                                                        <button
                                                            onClick={() => handleSkipRoute(route.id)}
                                                            className={cx(
                                                                "px-1.5 py-0.5 rounded text-[10px] transition-colors",
                                                                isSkipped 
                                                                    ? "bg-bg-tertiary text-fg-secondary"
                                                                    : "bg-bg-secondary text-fg-tertiary hover:bg-bg-tertiary"
                                                            )}
                                                        >
                                                            {isSkipped ? "Skipped" : "Skip"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {hasEncounters && !isCompleted && !isSkipped && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {route.pokemonMap.slice(0, 6).map((enc) => (
                                                        <div
                                                            key={enc.id}
                                                            className="relative group cursor-pointer"
                                                            title={`Add ${enc.species}`}
                                                        >
                                                            <div className="w-8 h-8 bg-bg-secondary rounded flex items-center justify-center hover:ring-2 hover:ring-primary-400 transition-all">
                                                                <SimplePokemonIcon species={enc.species} size={24} />
                                                            </div>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col bg-bg-primary border border-border rounded shadow-lg z-popover min-w-[80px]">
                                                                {STATUS_OPTIONS.map((status) => (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleAddPokemon(enc.species, status, route.routeName, route.id)}
                                                                        className="px-2 py-1 text-[10px] text-left hover:bg-primary-500 hover:text-fg-inverse first:rounded-t last:rounded-b transition-colors"
                                                                    >
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {route.pokemonMap.length > 6 && (
                                                        <span className="text-[10px] text-fg-secondary self-center">
                                                            +{route.pokemonMap.length - 6}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Bosses Section */}
                    {bosses.length > 0 && (
                        <CollapsibleSection title="Bosses" count={bosses.length}>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {bosses.map((boss) => (
                                    <div 
                                        key={boss.id}
                                        className="p-2 rounded border border-border bg-bg-primary text-xs"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{boss.name}</span>
                                            {boss.badge && (
                                                <span className="text-[10px] text-fg-secondary">
                                                    {boss.badge.name}
                                                </span>
                                            )}
                                        </div>
                                        {boss.pokemon.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {boss.pokemon.map((poke, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="relative w-8 h-8 bg-bg-secondary rounded flex items-center justify-center"
                                                        title={`${poke.species ?? 'Unknown'} Lv.${poke.level ?? '?'}`}
                                                    >
                                                        <SimplePokemonIcon species={poke.species ?? "Unknown"} size={24} />
                                                        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] px-0.5 rounded bg-primary-500 text-fg-inverse">
                                                            {poke.level ?? '?'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

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
