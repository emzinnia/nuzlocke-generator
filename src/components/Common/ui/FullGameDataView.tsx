import * as React from "react";
import type { FullGame } from "models/FullGame";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { Popover } from "./Popover";
import { Button } from "./Button";
import { Collapsible } from "./Collapsible";
import { addPokemonToRun, getRun } from "api/runs";

type StatusOption = "Team" | "Boxed" | "Dead" | "Champs" | "Missed";

type AddPokemonHandler = (input: {
    species: string;
    status: StatusOption;
    met: string;
    routeId: string;
    level?: number;
    metLevel?: number;
}) => Promise<void> | void;

interface FullGameDataViewProps {
    data: FullGame;
    runId?: string;
    onAddPokemon?: AddPokemonHandler;
    teamCount?: number;
}

export const FullGameDataView: React.FC<FullGameDataViewProps> = ({
    data,
    runId,
    onAddPokemon: externalAddPokemon,
    teamCount: externalTeamCount,
}) => {
    const [completedRoutes, setCompletedRoutes] = React.useState<Set<string>>(
        () => new Set()
    );
    const [skippedRoutes, setSkippedRoutes] = React.useState<Set<string>>(
        () => new Set()
    );
    const [internalTeamCount, setInternalTeamCount] = React.useState(0);

    const teamCount = externalTeamCount ?? internalTeamCount;

    React.useEffect(() => {
        if (!runId) return;
        getRun(runId).then((run) => {
            const pokemon = run.data.pokemon || [];
            const count = pokemon.filter((p) => p.status === "Team").length;
            setInternalTeamCount(count);
        });
    }, [runId]);

    const internalAddPokemon = React.useCallback<AddPokemonHandler>(
        async ({ species, status, met, routeId, level, metLevel }) => {
            if (!runId) return;
            await addPokemonToRun(runId, {
                species,
                nickname: species,
                status,
                met,
                level,
                metLevel,
            });
            if (status === "Team") {
                setInternalTeamCount((prev) => prev + 1);
            }
            setCompletedRoutes((prev) => {
                const next = new Set(prev);
                next.add(routeId);
                return next;
            });
            setSkippedRoutes((prev) => {
                if (!prev.has(routeId)) return prev;
                const next = new Set(prev);
                next.delete(routeId);
                return next;
            });
        },
        [runId]
    );

    const handleAddPokemon = React.useCallback<AddPokemonHandler>(
        async (input) => {
            if (externalAddPokemon) {
                await externalAddPokemon(input);
                setCompletedRoutes((prev) => {
                    const next = new Set(prev);
                    next.add(input.routeId);
                    return next;
                });
                setSkippedRoutes((prev) => {
                    if (!prev.has(input.routeId)) return prev;
                    const next = new Set(prev);
                    next.delete(input.routeId);
                    return next;
                });
            } else {
                await internalAddPokemon(input);
            }
        },
        [externalAddPokemon, internalAddPokemon]
    );

    const handleSkipRoute = React.useCallback((routeId: string) => {
        setSkippedRoutes((prev) => {
            const next = new Set(prev);
            if (next.has(routeId)) {
                next.delete(routeId);
            } else {
                next.add(routeId);
            }
            return next;
        });
        setCompletedRoutes((prev) => {
            if (!prev.has(routeId)) return prev;
            const next = new Set(prev);
            next.delete(routeId);
            return next;
        });
    }, []);

    return (
        <div className="space-y-6">
            <GameHeader data={data} />
            <RoutesSection
                routes={data.routes}
                onAddPokemon={handleAddPokemon}
                completedRoutes={completedRoutes}
                skippedRoutes={skippedRoutes}
                onSkipRoute={handleSkipRoute}
                teamCount={teamCount}
            />
            <BossesSection bosses={data.bosses} />
            <TrainerRoutesSection orders={data.trainerRoutesOrders} />
        </div>
    );
};

function GameHeader({ data }: { data: FullGame }) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {data.name}
            </h2>
            {data.id && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    ID: {data.id}
                </p>
            )}
            {data.isRomHack && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                    ROM Hack
                </span>
            )}
            {data.isADifficultyHack && (
                <span className="inline-block mt-2 ml-2 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                    Difficulty Hack
                </span>
            )}
        </div>
    );
}

function RoutesSection({
    routes,
    onAddPokemon,
    completedRoutes,
    skippedRoutes,
    onSkipRoute,
    teamCount,
}: {
    routes: FullGame["routes"];
    onAddPokemon: AddPokemonHandler;
    completedRoutes: Set<string>;
    skippedRoutes: Set<string>;
    onSkipRoute: (routeId: string) => void;
    teamCount: number;
}) {
    if (!routes.length) return null;

    return (
        <Collapsible title={`Routes (${routes.length})`} defaultOpen>
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1 routes-scrollbar">
                {routes.map((route) => (
                    <RouteCard
                        key={route.id}
                        route={route}
                        onAddPokemon={onAddPokemon}
                        isCompleted={completedRoutes.has(route.id)}
                        isSkipped={skippedRoutes.has(route.id)}
                        onSkipRoute={onSkipRoute}
                        teamCount={teamCount}
                    />
                ))}
            </div>
        </Collapsible>
    );
}

function RouteCard({
    route,
    onAddPokemon,
    isCompleted,
    isSkipped,
    onSkipRoute,
    teamCount,
}: {
    route: FullGame["routes"][number];
    onAddPokemon: AddPokemonHandler;
    isCompleted: boolean;
    isSkipped: boolean;
    onSkipRoute: (routeId: string) => void;
    teamCount: number;
}) {
    const hasEncounters = route.pokemonMap.length > 0;
    const isCollapsed = isCompleted || isSkipped || !hasEncounters;

    return (
        <div
            className={`p-3 rounded-sm border transition-colors ${
                isSkipped
                    ? "border-gray-300 bg-gray-100 text-gray-500 dark:bg-gray-900/40 dark:border-gray-700"
                    : isCompleted
                      ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                      : "bg-card text-card-foreground border-border"
            }`}
        >
            <div className="flex items-center justify-between mb-1 gap-2">
                <p
                    className={`text-sm font-medium ${
                        isSkipped
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-gray-900 dark:text-gray-100"
                    }`}
                >
                    {route.routeName}
                </p>
                <div className="flex items-center gap-2">
                    {isCompleted && (
                        <span className="text-green-600 dark:text-green-300 font-semibold">
                            ✓
                        </span>
                    )}
                    {!isCompleted && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onSkipRoute(route.id)}
                            className={`text-xs px-2 py-1 ${
                                isSkipped
                                    ? "border-gray-300 bg-gray-200 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                            aria-pressed={isSkipped}
                        >
                            {isSkipped ? "Skipped" : "Skip"}
                        </Button>
                    )}
                </div>
            </div>
            {!isCollapsed && (
                <EncounterList
                    encounters={route.pokemonMap}
                    routeName={route.routeName}
                    routeId={route.id}
                    onAddPokemon={onAddPokemon}
                    teamCount={teamCount}
                />
            )}
        </div>
    );
}

function EncounterList({
    encounters,
    routeName,
    onAddPokemon,
    routeId,
    teamCount,
}: {
    encounters: FullGame["routes"][number]["pokemonMap"];
    routeName: string;
    onAddPokemon: AddPokemonHandler;
    routeId: string;
    teamCount: number;
}) {
    const isStarterRoute = routeName === "Starter";

    const getStarterStyle = (species: string): { ringClass: string; glowColor: string } | undefined => {
        if (!isStarterRoute) return undefined;
        
        switch (species) {
            case "Bulbasaur":
                return { ringClass: "ring-green-500", glowColor: "0 0 12px rgba(34, 197, 94, 0.6)" };
            case "Charmander":
                return { ringClass: "ring-red-500", glowColor: "0 0 12px rgba(239, 68, 68, 0.6)" };
            case "Squirtle":
                return { ringClass: "ring-blue-500", glowColor: "0 0 12px rgba(59, 130, 246, 0.6)" };
            default:
                return undefined;
        }
    };

    return (
        <div className="mt-2">
            <ul className={`flex flex-wrap ${isStarterRoute ? 'gap-4 justify-center' : 'gap-1'}`}>
                {encounters.map((encounter) => (
                    <EncounterPokemonCard
                        key={encounter.id}
                        encounter={encounter}
                        routeName={routeName}
                        routeId={routeId}
                        onAddPokemon={onAddPokemon}
                        teamCount={teamCount}
                        isStarterRoute={isStarterRoute}
                        starterStyle={getStarterStyle(encounter.species)}
                    />
                ))}
            </ul>
        </div>
    );
}

function EncounterPokemonCard({
    encounter,
    routeName,
    routeId,
    onAddPokemon,
    teamCount,
    isStarterRoute,
    starterStyle,
}: {
    encounter: FullGame["routes"][number]["pokemonMap"][number];
    routeName: string;
    routeId: string;
    onAddPokemon: AddPokemonHandler;
    teamCount: number;
    isStarterRoute: boolean;
    starterStyle?: { ringClass: string; glowColor: string };
}) {
    const [selectedLevel, setSelectedLevel] = React.useState<number>(encounter.levelRange[0]);
    
    const hasVariableLevelRange = encounter.levelRange[0] !== encounter.levelRange[1];
    const targetStatus: StatusOption = teamCount < 6 ? "Team" : "Boxed";

    const handleDirectAdd = () => {
        const level = encounter.levelRange[0];
        onAddPokemon({
            species: encounter.species,
            status: targetStatus,
            met: routeName,
            routeId,
            level,
            metLevel: level,
        });
    };

    const handleAddWithLevel = () => {
        onAddPokemon({
            species: encounter.species,
            status: targetStatus,
            met: routeName,
            routeId,
            level: selectedLevel,
            metLevel: selectedLevel,
        });
    };

    const levelOptions = React.useMemo(() => {
        const [min, max] = encounter.levelRange;
        const options: number[] = [];
        for (let i = min; i <= max; i++) {
            options.push(i);
        }
        return options;
    }, [encounter.levelRange]);

    const cardContent = (
        <div 
            className={`bg-card text-primary flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isStarterRoute 
                    ? `w-20 h-20 rounded-full ring-[3px] ${starterStyle?.ringClass ?? ''} hover:scale-110 hover:ring-4` 
                    : 'h-12 rounded-sm p-1 hover:ring-2 hover:ring-blue-400'
            }`}
            style={isStarterRoute && starterStyle ? { boxShadow: starterStyle.glowColor } : undefined}
        >
            <PokemonIcon 
                species={encounter.species}
                imageStyle={isStarterRoute ? { width: 56, height: 42, transform: 'scale(1.4)' } : undefined}
            />
        </div>
    );

    if (hasVariableLevelRange) {
        return (
            <li>
                <Popover
                    position="bottom"
                    minimal
                    content={
                        <div className="p-3 min-w-[160px]">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {encounter.species}
                            </p>
                            <div className="mb-3">
                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                                    Level ({encounter.levelRange[0]}–{encounter.levelRange[1]})
                                </label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                                    className="w-full px-2 py-1.5 text-sm border border-border bg-input rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {levelOptions.map((level) => (
                                        <option key={level} value={level}>
                                            Lv. {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleAddWithLevel}
                                className="w-full text-sm"
                            >
                                Add to {targetStatus}
                            </Button>
                        </div>
                    }
                >
                    {cardContent}
                </Popover>
            </li>
        );
    }

    return (
        <li>
            <div onClick={handleDirectAdd}>
                {cardContent}
            </div>
        </li>
    );
}

function BossesSection({
    bosses,
}: {
    bosses: FullGame["bosses"];
}) {
    if (!bosses.length) return null;

    return (
        <Collapsible title={`Bosses (${bosses.length})`} defaultOpen>
            <div className="space-y-3">
                {bosses.map((trainer) => (
                    <TrainerCard key={trainer.id} trainer={trainer} />
                ))}
            </div>
        </Collapsible>
    );
}

function TrainerCard({
    trainer,
}: {
    trainer: FullGame["bosses"][number];
}) {
    const hasPokemon = trainer.pokemon.length > 0;

    return (
        <div className="p-3 bg-card text-card-foreground rounded-sm border border-border">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {trainer.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {trainer.id}
                    </p>
                </div>
                {trainer.badge && (
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {trainer.badge.name}
                        </p>
                    </div>
                )}
            </div>
            {hasPokemon ? (
                <TrainerPokemonList pokemon={trainer.pokemon} />
            ) : (
                <EmptyTrainerPokemon />
            )}
        </div>
    );
}

function TrainerPokemonList({
    pokemon,
}: {
    pokemon: FullGame["bosses"][number]["pokemon"];
}) {
    return (
        <div className="mt-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Pokémon ({pokemon.length}):
            </p>
            <ul className="flex flex-wrap gap-2">
                {pokemon.map((entry, idx) => (
                    <li key={idx}>
                        <div className="relative bg-card h-12 w-12 text-primary rounded-sm p-1 flex items-center justify-center border border-border">
                            <PokemonIcon species={entry.species ?? "Unknown"} />
                            <span className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0.5 rounded-sm bg-primary text-white">
                                {entry.level != null ? `Lv. ${entry.level}` : "Lv. ?"}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function EmptyTrainerPokemon() {
    return (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            No Pokémon defined
        </p>
    );
}

function TrainerRoutesSection({
    orders,
}: {
    orders: FullGame["trainerRoutesOrders"];
}) {
    if (!orders.length) return null;

    return (
        <Collapsible title={`Trainer Route Orders (${orders.length})`} defaultOpen>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                    {orders.join(", ") || "None"}
                </p>
            </div>
        </Collapsible>
    );
}
