import * as React from "react";
import { Link } from "react-router-dom";
import type { RunSummary } from "api/runs";
import { Button, Icon } from "components/ui";
import { Intent } from "components/ui/intent";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";

interface GameBadgeProps {
    game: string | null;
    size?: "sm" | "md";
}

const gameColors: Record<string, { bg: string; text: string; border: string }> = {
    Red: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50" },
    Blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" },
    Yellow: { bg: "bg-yellow-400/20", text: "text-yellow-300", border: "border-yellow-400/50" },
    Gold: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
    Silver: { bg: "bg-slate-400/20", text: "text-slate-300", border: "border-slate-400/50" },
    Crystal: { bg: "bg-cyan-400/20", text: "text-cyan-300", border: "border-cyan-400/50" },
    Ruby: { bg: "bg-red-600/20", text: "text-red-400", border: "border-red-600/50" },
    Sapphire: { bg: "bg-blue-600/20", text: "text-blue-400", border: "border-blue-600/50" },
    Emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
    FireRed: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50" },
    LeafGreen: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50" },
    Diamond: { bg: "bg-indigo-300/20", text: "text-indigo-300", border: "border-indigo-300/50" },
    Pearl: { bg: "bg-pink-300/20", text: "text-pink-300", border: "border-pink-300/50" },
    Platinum: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/50" },
    HeartGold: { bg: "bg-amber-400/20", text: "text-amber-300", border: "border-amber-400/50" },
    SoulSilver: { bg: "bg-slate-300/20", text: "text-slate-200", border: "border-slate-300/50" },
    Black: { bg: "bg-slate-800/40", text: "text-slate-200", border: "border-slate-600/50" },
    White: { bg: "bg-slate-100/20", text: "text-slate-200", border: "border-slate-200/50" },
    "Black 2": { bg: "bg-slate-700/30", text: "text-slate-200", border: "border-slate-500/50" },
    "White 2": { bg: "bg-slate-200/20", text: "text-slate-200", border: "border-slate-300/50" },
    X: { bg: "bg-blue-400/20", text: "text-blue-300", border: "border-blue-400/50" },
    Y: { bg: "bg-red-400/20", text: "text-red-300", border: "border-red-400/50" },
    "Omega Ruby": { bg: "bg-red-700/20", text: "text-red-400", border: "border-red-700/50" },
    "Alpha Sapphire": { bg: "bg-blue-700/20", text: "text-blue-400", border: "border-blue-700/50" },
    Sun: { bg: "bg-orange-400/20", text: "text-orange-300", border: "border-orange-400/50" },
    Moon: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/50" },
    "Ultra Sun": { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50" },
    "Ultra Moon": { bg: "bg-purple-600/20", text: "text-purple-400", border: "border-purple-600/50" },
    Sword: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/50" },
    Shield: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" },
    Scarlet: { bg: "bg-rose-600/20", text: "text-rose-400", border: "border-rose-600/50" },
    Violet: { bg: "bg-violet-600/20", text: "text-violet-400", border: "border-violet-600/50" },
};

const GameBadge: React.FC<GameBadgeProps> = ({ game, size = "sm" }) => {
    if (!game) return null;
    
    const colors = gameColors[game] || { 
        bg: "bg-slate-500/20", 
        text: "text-slate-300", 
        border: "border-slate-500/50" 
    };
    
    const sizeClasses = size === "sm" 
        ? "px-2 py-0.5 text-xs" 
        : "px-3 py-1 text-sm";

    return (
        <span className={`inline-flex items-center rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}>
            {game}
        </span>
    );
};

interface RunCardProps {
    run: RunSummary;
}

const RunCard: React.FC<RunCardProps> = ({ run }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Link
            to={`/run/${run.slug}`}
            className="block p-3 rounded-lg border border-border bg-bg-tertiary hover:bg-bg-overlay/10 hover:border-primary-500/50 transition-all duration-150 group"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-fg-primary truncate group-hover:text-primary-400 transition-colors">
                        {run.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <GameBadge game={run.game_name || run.game} />
                        <span className="text-xs text-fg-tertiary">
                            {formatDate(run.updated_at)}
                        </span>
                    </div>
                </div>
                <Icon icon="chevron-right" size={16} className="text-fg-tertiary group-hover:text-primary-400 transition-colors" />
            </div>
            
            <div className="flex items-center justify-between">
                <span className="text-xs text-fg-secondary">
                    {run.pokemon_count} Pokémon
                </span>
                <span className="text-xs text-fg-tertiary">
                    Rev. {run.revision}
                </span>
            </div>
        </Link>
    );
};

interface GameGroupProps {
    game: string;
    runs: RunSummary[];
    defaultOpen?: boolean;
}

const GameGroup: React.FC<GameGroupProps> = ({ game, runs, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    
    return (
        <div className="border border-border rounded-lg overflow-hidden bg-bg-secondary">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-bg-tertiary transition-colors"
            >
                <div className="flex items-center gap-3">
                    <GameBadge game={game} size="md" />
                    <span className="text-sm text-fg-secondary">
                        {runs.length} {runs.length === 1 ? "run" : "runs"}
                    </span>
                </div>
                <Icon icon={isOpen ? "chevron-up" : "chevron-down"} size={16} />
            </button>
            
            {isOpen && (
                <div className="p-2 pt-0 space-y-2">
                    {runs.map((run) => (
                        <RunCard key={run.id} run={run} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface BackendRunsListProps {
    runs: RunSummary[];
    onCreateRun?: () => void;
}

export const BackendRunsList: React.FC<BackendRunsListProps> = ({ runs, onCreateRun }) => {
    const groupedRuns = React.useMemo(() => {
        const groups: Record<string, RunSummary[]> = {};
        
        for (const run of runs) {
            const game = run.game_name || run.game || "No Game";
            if (!groups[game]) {
                groups[game] = [];
            }
            groups[game].push(run);
        }
        
        // Sort runs within each group by updated_at
        for (const game of Object.keys(groups)) {
            groups[game].sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
        }
        
        return groups;
    }, [runs]);
    
    const sortedGames = React.useMemo(() => {
        return Object.keys(groupedRuns).sort((a, b) => {
            // "No Game" goes last
            if (a === "No Game") return 1;
            if (b === "No Game") return -1;
            
            // Sort by most recently updated run in each group
            const aLatest = groupedRuns[a][0]?.updated_at || "";
            const bLatest = groupedRuns[b][0]?.updated_at || "";
            return new Date(bLatest).getTime() - new Date(aLatest).getTime();
        });
    }, [groupedRuns]);

    if (runs.length === 0) {
        return (
            <div className="text-center py-8">
                <Icon icon="folder-close" size={48} className="text-fg-tertiary mx-auto mb-3" />
                <p className="text-fg-secondary mb-4">No runs yet</p>
                {onCreateRun && (
                    <Button intent={Intent.PRIMARY} icon="plus" onClick={onCreateRun}>
                        Create Your First Run
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-fg-secondary">
                    {runs.length} {runs.length === 1 ? "Run" : "Runs"} across {sortedGames.length} {sortedGames.length === 1 ? "game" : "games"}
                </h3>
                {onCreateRun && (
                    <Button small icon="plus" onClick={onCreateRun}>
                        New Run
                    </Button>
                )}
            </div>
            
            <div className="space-y-2">
                {sortedGames.map((game, index) => (
                    <GameGroup 
                        key={game} 
                        game={game} 
                        runs={groupedRuns[game]} 
                        defaultOpen={index === 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default BackendRunsList;

