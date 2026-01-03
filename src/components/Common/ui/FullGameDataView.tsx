import * as React from "react";
import type { FullGame } from "models/FullGame";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { Popover } from "./Popover";
import { Button } from "./Button";
import { Collapsible } from "./Collapsible";
import { addPokemonToRun } from "api/runs";

const STATUS_OPTIONS = ["Team", "Boxed", "Dead", "Champs", "Missed"] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number];

type AddPokemonHandler = (input: {
    species: string;
    status: StatusOption;
    met: string;
    routeId: string;
}) => Promise<void> | void;

interface FullGameDataViewProps {
    data: FullGame;
    runId?: string;
}

export const FullGameDataView: React.FC<FullGameDataViewProps> = ({
    data,
    runId,
}) => {
    const [completedRoutes, setCompletedRoutes] = React.useState<Set<string>>(
        () => new Set()
    );
    const [skippedRoutes, setSkippedRoutes] = React.useState<Set<string>>(
        () => new Set()
    );

    const handleAddPokemon = React.useCallback<AddPokemonHandler>(
        async ({ species, status, met, routeId }) => {
            if (!runId) return;
            await addPokemonToRun(runId, {
                species,
                nickname: species,
                status,
                met,
            });
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
}: {
    routes: FullGame["routes"];
    onAddPokemon: AddPokemonHandler;
    completedRoutes: Set<string>;
    skippedRoutes: Set<string>;
    onSkipRoute: (routeId: string) => void;
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
}: {
    route: FullGame["routes"][number];
    onAddPokemon: AddPokemonHandler;
    isCompleted: boolean;
    isSkipped: boolean;
    onSkipRoute: (routeId: string) => void;
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
}: {
    encounters: FullGame["routes"][number]["pokemonMap"];
    routeName: string;
    onAddPokemon: AddPokemonHandler;
    routeId: string;
}) {
    const isStarterRoute = routeName === "Starter";

    const getStarterRingColor = (species: string) => {
        if (!isStarterRoute) return undefined;
        
        switch (species) {
            case "Bulbasaur":
                return "ring-green-500";
            case "Charmander":
                return "ring-red-500";
            case "Squirtle":
                return "ring-blue-500";
            default:
                return undefined;
        }
    };

    return (
        <div className="mt-2">
            <ul className="flex flex-wrap gap-1">
                {encounters.map((encounter) => {
                    const ringColor = getStarterRingColor(encounter.species);
                    
                    return (
                        <li key={encounter.id}>
                            <Popover
                                position="bottom"
                                minimal
                                content={
                                    <div className="flex flex-col min-w-[100px]">
                                        {STATUS_OPTIONS.map((status) => (
                                            <Button
                                                key={status}
                                                variant="ghost"
                                                onClick={() =>
                                                    onAddPokemon({
                                                        species: encounter.species,
                                                        status,
                                                        met: routeName,
                                                        routeId,
                                                    })
                                                }
                                                className="w-full px-3 py-2 justify-start text-left text-sm bg-primary-foreground hover:bg-primary/90 first:rounded-t last:rounded-b"
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                }
                            >
                                <div 
                                    className={`bg-card text-primary rounded-sm p-1 flex items-center justify-center cursor-pointer transition-all ${
                                        isStarterRoute 
                                            ? `h-16 hover:ring-4 ${ringColor ? `ring-4 ${ringColor}` : ''}` 
                                            : 'h-12 hover:ring-2 hover:ring-blue-400'
                                    }`}
                                >
                                    <PokemonIcon 
                                        species={encounter.species}
                                        imageStyle={isStarterRoute ? { width: 60, height: 45 } : undefined}
                                    />
                                </div>
                            </Popover>
                        </li>
                    );
                })}
            </ul>
        </div>
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
