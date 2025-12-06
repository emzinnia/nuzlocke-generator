import * as React from "react";
import type { FullGame } from "models/FullGame";
import { PokemonIconPlain } from "components/Pokemon/PokemonIcon";
import { Popover } from "./Popover";
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
        },
        [runId]
    );

    return (
        <div className="space-y-6">
            <GameHeader data={data} />
            <RoutesSection
                routes={data.routes}
                onAddPokemon={handleAddPokemon}
                completedRoutes={completedRoutes}
            />
            <KeyTrainersSection keyTrainers={data.keyTrainers} />
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
}: {
    routes: FullGame["routes"];
    onAddPokemon: AddPokemonHandler;
    completedRoutes: Set<string>;
}) {
    if (!routes.length) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Routes ({routes.length})
            </h3>
            <div className="space-y-3">
                {routes.map((route) => (
                    <RouteCard
                        key={route.id}
                        route={route}
                        onAddPokemon={onAddPokemon}
                        isCompleted={completedRoutes.has(route.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function RouteCard({
    route,
    onAddPokemon,
    isCompleted,
}: {
    route: FullGame["routes"][number];
    onAddPokemon: AddPokemonHandler;
    isCompleted: boolean;
}) {
    const hasEncounters = route.pokemonMap.length > 0;

    return (
        <div
            className={`p-3 bg-card text-card-foreground rounded-sm border border-border ${
                isCompleted
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : ""
            }`}
        >
            <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {route.routeName}
                </p>
                {isCompleted && (
                    <span className="text-green-600 dark:text-green-300 font-semibold">
                        ✓
                    </span>
                )}
            </div>
            {!isCompleted && hasEncounters && (
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
    return (
        <div className="mt-2">
            <ul className="flex flex-wrap gap-1">
                {encounters.map((encounter) => (
                    <li key={encounter.id}>
                        <Popover
                            position="bottom"
                            minimal
                            content={
                                <div className="flex flex-col min-w-[100px]">
                                    {STATUS_OPTIONS.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() =>
                                                onAddPokemon({
                                                    species: encounter.species,
                                                    status,
                                                    met: routeName,
                                                    routeId,
                                                })
                                            }
                                            className="px-3 py-2 cursor-pointer text-left text-sm bg-primary-foreground hover:bg-primary/90 first:rounded-t last:rounded-b"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            <div className="bg-card h-12 text-primary rounded-sm p-1 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                                <PokemonIconPlain species={encounter.species} />
                            </div>
                        </Popover>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function KeyTrainersSection({
    keyTrainers,
}: {
    keyTrainers: FullGame["keyTrainers"];
}) {
    if (!keyTrainers.length) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Key Trainers ({keyTrainers.length})
            </h3>
            <div className="space-y-3">
                {keyTrainers.map((trainer) => (
                    <TrainerCard key={trainer.id} trainer={trainer} />
                ))}
            </div>
        </div>
    );
}

function TrainerCard({
    trainer,
}: {
    trainer: FullGame["keyTrainers"][number];
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
    pokemon: FullGame["keyTrainers"][number]["pokemon"];
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
                            <PokemonIconPlain species={entry.species ?? "Unknown"} />
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
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Trainer Route Orders
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                    {orders.join(", ") || "None"}
                </p>
            </div>
        </div>
    );
}
