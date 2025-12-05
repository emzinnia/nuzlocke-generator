import * as React from "react";
import type { FullGame } from "models/FullGame";

interface FullGameDataViewProps {
    data: FullGame;
}

export const FullGameDataView: React.FC<FullGameDataViewProps> = ({ data }) => {
    return (
        <div className="space-y-6">
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

            {data.routes.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Routes ({data.routes.length})
                    </h3>
                    <div className="space-y-3">
                        {data.routes.map((route) => (
                            <div
                                key={route.id}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                    {route.routeName}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    ID: {route.id}
                                </p>
                                {route.pokemonMap.length > 0 ? (
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Encounters ({route.pokemonMap.length}):
                                        </p>
                                        <ul className="space-y-1">
                                            {route.pokemonMap.map((encounter, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-xs text-gray-700 dark:text-gray-300 pl-2 border-l-2 border-blue-300 dark:border-blue-600"
                                                >
                                                    {encounter.Pokemon.species} (Lv.
                                                    {encounter.Pokemon.levelRange[0]}-
                                                    {encounter.Pokemon.levelRange[1]}) -{" "}
                                                    {encounter.method}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        No encounters defined
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.keyTrainers.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Key Trainers ({data.keyTrainers.length})
                    </h3>
                    <div className="space-y-3">
                        {data.keyTrainers.map((trainer) => (
                            <div
                                key={trainer.id}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
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
                                {trainer.time && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Time: {trainer.time}
                                    </p>
                                )}
                                {trainer.pokemon.length > 0 ? (
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Pokémon ({trainer.pokemon.length}):
                                        </p>
                                        <ul className="space-y-1">
                                            {trainer.pokemon.map((pokemon, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-xs text-gray-700 dark:text-gray-300"
                                                >
                                                    {pokemon.species}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        No Pokémon defined
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.trainerRoutesOrders.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Trainer Route Orders
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                            {data.trainerRoutesOrders.join(", ") || "None"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

