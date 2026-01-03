import * as React from "react";
import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { Run } from "api/runs";
import type { State } from "state";
import { ErrorBoundary, Skeleton } from "components/Common/Shared";
import { Button, Icon } from "components/ui";
import { Intent } from "components/ui/intent";
import { replaceState, switchNuzlocke } from "actions";

const ResultView = React.lazy(() =>
    import("components/Features/Result/ResultView").then((res) => ({
        default: res.ResultView,
    }))
);

export interface RunLoaderData {
    run: Run | null;
    isBackendRun: boolean;
    runId: string;
}

interface LocalRunData {
    id: string;
    name: string;
    game: string | null;
    data: Partial<State>;
    lastEdited?: number;
}

interface GameBadgeProps {
    game: string | null;
}

const GameBadge: React.FC<GameBadgeProps> = ({ game }) => {
    if (!game) return null;

    const gameColors: Record<string, { bg: string; text: string }> = {
        Red: { bg: "bg-red-500", text: "text-white" },
        Blue: { bg: "bg-blue-500", text: "text-white" },
        Yellow: { bg: "bg-yellow-400", text: "text-yellow-900" },
        Gold: { bg: "bg-amber-500", text: "text-white" },
        Silver: { bg: "bg-slate-400", text: "text-white" },
        Crystal: { bg: "bg-cyan-400", text: "text-cyan-900" },
        Ruby: { bg: "bg-red-600", text: "text-white" },
        Sapphire: { bg: "bg-blue-600", text: "text-white" },
        Emerald: { bg: "bg-emerald-500", text: "text-white" },
        FireRed: { bg: "bg-orange-500", text: "text-white" },
        LeafGreen: { bg: "bg-green-500", text: "text-white" },
        Diamond: { bg: "bg-indigo-300", text: "text-indigo-900" },
        Pearl: { bg: "bg-pink-300", text: "text-pink-900" },
        Platinum: { bg: "bg-slate-500", text: "text-white" },
        HeartGold: { bg: "bg-amber-400", text: "text-amber-900" },
        SoulSilver: { bg: "bg-slate-300", text: "text-slate-800" },
        Black: { bg: "bg-slate-800", text: "text-white" },
        White: { bg: "bg-slate-100", text: "text-slate-800" },
        "Black 2": { bg: "bg-slate-700", text: "text-white" },
        "White 2": { bg: "bg-slate-200", text: "text-slate-800" },
        X: { bg: "bg-blue-400", text: "text-white" },
        Y: { bg: "bg-red-400", text: "text-white" },
        "Omega Ruby": { bg: "bg-red-700", text: "text-white" },
        "Alpha Sapphire": { bg: "bg-blue-700", text: "text-white" },
        Sun: { bg: "bg-orange-400", text: "text-white" },
        Moon: { bg: "bg-purple-500", text: "text-white" },
        "Ultra Sun": { bg: "bg-orange-500", text: "text-white" },
        "Ultra Moon": { bg: "bg-purple-600", text: "text-white" },
        "Let's Go Pikachu": { bg: "bg-yellow-400", text: "text-yellow-900" },
        "Let's Go Eevee": { bg: "bg-amber-300", text: "text-amber-900" },
        Sword: { bg: "bg-cyan-500", text: "text-white" },
        Shield: { bg: "bg-rose-500", text: "text-white" },
        "Brilliant Diamond": { bg: "bg-indigo-400", text: "text-white" },
        "Shining Pearl": { bg: "bg-pink-400", text: "text-white" },
        "Legends Arceus": { bg: "bg-slate-600", text: "text-white" },
        Scarlet: { bg: "bg-rose-600", text: "text-white" },
        Violet: { bg: "bg-violet-600", text: "text-white" },
    };

    const colors = gameColors[game] || { bg: "bg-slate-500", text: "text-white" };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {game}
        </span>
    );
};

export const RunPage: React.FC = () => {
    const loaderData = useLoaderData() as RunLoaderData;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get local nuzlockes from Redux state
    const nuzlockes = useSelector((state: State) => state.nuzlockes);
    const currentReduxState = useSelector((state: State) => state);
    
    // Find local run if not a backend run
    const localRun = React.useMemo((): LocalRunData | null => {
        if (loaderData.isBackendRun && loaderData.run) {
            return null;
        }
        
        const save = nuzlockes.saves.find((s) => s.id === loaderData.runId);
        if (!save) return null;
        
        try {
            const parsedData = JSON.parse(save.data);
            return {
                id: save.id,
                name: parsedData?.game?.name || "Untitled Run",
                game: parsedData?.game?.name || null,
                data: parsedData,
                lastEdited: save.lastEdited,
            };
        } catch {
            return null;
        }
    }, [loaderData, nuzlockes.saves]);
    
    // Determine which run to display (backend or local)
    const isBackendRun = loaderData.isBackendRun && loaderData.run;
    const backendRun = loaderData.run;
    
    // Get run data from either source
    const runData = isBackendRun ? backendRun?.data : localRun?.data;
    const runName = isBackendRun 
        ? backendRun?.name 
        : (localRun?.data?.game?.name || "Untitled Run");
    const runGame = isBackendRun 
        ? (backendRun?.game_name || backendRun?.game) 
        : localRun?.game;
    const runId = loaderData.runId;
    
    // Check if this is the currently active nuzlocke
    const isCurrentNuzlocke = nuzlockes.currentId === runId;

    const handleLoadRun = React.useCallback(() => {
        if (isBackendRun && backendRun?.data) {
            dispatch(replaceState(backendRun.data));
            navigate("/");
        } else if (localRun) {
            dispatch(switchNuzlocke(localRun.id));
            dispatch(replaceState(localRun.data));
            navigate("/");
        }
    }, [dispatch, navigate, isBackendRun, backendRun, localRun]);

    const formatDate = (dateString: string | number | undefined) => {
        if (!dateString) return "Unknown";
        const date = typeof dateString === "number" 
            ? new Date(dateString) 
            : new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Handle run not found
    if (!isBackendRun && !localRun) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary p-8">
                <Icon icon="warning-sign" size={48} className="text-warning-500 mb-4" />
                <h2 className="text-xl font-semibold text-fg-primary mb-2">Run Not Found</h2>
                <p className="text-fg-secondary mb-4">
                    This run could not be found in your local saves or on the server.
                </p>
                <Link to="/">
                    <Button intent={Intent.PRIMARY}>Go to Editor</Button>
                </Link>
            </div>
        );
    }

    const pokemonList = runData?.pokemon || [];
    const pokemonCount = pokemonList.length;
    const teamPokemon = pokemonList.filter((p) => p.status === "Team");
    const deadPokemon = pokemonList.filter((p) => p.status === "Dead");
    const boxedPokemon = pokemonList.filter((p) => p.status === "Boxed");

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-auto bg-bg-primary">
            {/* Header */}
            <div className="border-b border-border bg-bg-secondary px-6 py-4">
                <div className="flex items-center gap-3 mb-3">
                    <Link
                        to="/"
                        className="text-fg-secondary hover:text-fg-primary transition-colors"
                    >
                        <Icon icon="arrow-left" size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-fg-primary">{runName}</h1>
                    <GameBadge game={runGame || null} />
                    {isCurrentNuzlocke && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
                            Current
                        </span>
                    )}
                    {!isBackendRun && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-bg-tertiary text-fg-secondary">
                            Local
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm text-fg-secondary">
                    {isBackendRun && backendRun ? (
                        <>
                            <span>Created: {formatDate(backendRun.inserted_at)}</span>
                            <span>•</span>
                            <span>Updated: {formatDate(backendRun.updated_at)}</span>
                            <span>•</span>
                            <span>Revision: {backendRun.revision}</span>
                        </>
                    ) : (
                        <span>Last edited: {formatDate(localRun?.lastEdited)}</span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 border-b border-border bg-bg-secondary/50">
                <div className="grid grid-cols-4 gap-4 max-w-2xl">
                    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-fg-primary">{pokemonCount}</div>
                        <div className="text-xs text-fg-secondary">Total</div>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-success-600">{teamPokemon.length}</div>
                        <div className="text-xs text-fg-secondary">Team</div>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-primary-600">{boxedPokemon.length}</div>
                        <div className="text-xs text-fg-secondary">Boxed</div>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-danger-600">{deadPokemon.length}</div>
                        <div className="text-xs text-fg-secondary">Dead</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <Button intent={Intent.PRIMARY} icon="edit" onClick={handleLoadRun}>
                    Open in Editor
                </Button>
                <Button variant="outline" icon="download">
                    Export
                </Button>
                <Button variant="outline" icon="duplicate">
                    Duplicate
                </Button>
                <Button variant="ghost" intent={Intent.DANGER} icon="trash">
                    Delete
                </Button>
            </div>

            {/* Preview */}
            <div className="flex-1 p-6 overflow-auto">
                <h2 className="text-lg font-semibold text-fg-primary mb-4">Preview</h2>
                <div className="bg-bg-tertiary rounded-lg p-4 overflow-auto">
                    <ErrorBoundary key="result-preview">
                        <React.Suspense fallback={<Skeleton />}>
                            <ResultView />
                        </React.Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default RunPage;

