import * as React from "react";
import { listOfPokemon, Species } from "utils/data/listOfPokemon";
import { speciesToNumber } from "utils/getters/speciesToNumber";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { Types } from "utils/Types";
import { Select } from "components/Common/ui";

// Type colors for badges
const typeColors: Record<string, string> = {
    [Types.Normal]: "bg-gray-400",
    [Types.Fire]: "bg-red-500",
    [Types.Water]: "bg-blue-500",
    [Types.Electric]: "bg-yellow-400",
    [Types.Grass]: "bg-green-500",
    [Types.Ice]: "bg-cyan-300",
    [Types.Fighting]: "bg-orange-700",
    [Types.Poison]: "bg-purple-500",
    [Types.Ground]: "bg-amber-600",
    [Types.Flying]: "bg-indigo-300",
    [Types.Psychic]: "bg-pink-500",
    [Types.Bug]: "bg-lime-500",
    [Types.Rock]: "bg-stone-500",
    [Types.Ghost]: "bg-purple-700",
    [Types.Dragon]: "bg-violet-600",
    [Types.Dark]: "bg-stone-700",
    [Types.Steel]: "bg-slate-400",
    [Types.Fairy]: "bg-pink-300",
};

const pokemonTypes = [
    "All Types",
    Types.Normal,
    Types.Fire,
    Types.Water,
    Types.Electric,
    Types.Grass,
    Types.Ice,
    Types.Fighting,
    Types.Poison,
    Types.Ground,
    Types.Flying,
    Types.Psychic,
    Types.Bug,
    Types.Rock,
    Types.Ghost,
    Types.Dragon,
    Types.Dark,
    Types.Steel,
    Types.Fairy,
];

// Get image path for a Pokemon
const getPokemonImagePath = (species: string): string => {
    const normalized = species
        .trim()
        .toLowerCase()
        .replace(/\s/g, "-")
        .replace(/'/g, "")
        .replace(/:/g, "-")
        .replace(/♀/g, "-f")
        .replace(/♂/g, "-m");
    return `/img/${normalized}.jpg`;
};

// Type badge component
const TypeBadge: React.FC<{ type: Types }> = ({ type }) => {
    if (type === Types.Normal && type === type) {
        // Check if it's a "None" type (same type twice means single type)
    }
    const colorClass = typeColors[type] || "bg-gray-400";
    return (
        <span className={`${colorClass} text-white text-xs px-2 py-0.5 rounded font-medium`}>
            {type}
        </span>
    );
};

// Pokemon card component
const PokemonCard: React.FC<{ species: string; dexNumber: number; types: [Types, Types] }> = ({
    species,
    dexNumber,
    types,
}) => {
    const [imageError, setImageError] = React.useState(false);
    const imagePath = getPokemonImagePath(species);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-3 flex flex-col items-center hover:shadow-lg dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="w-20 h-20 mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {!imageError ? (
                    <img
                        src={imagePath}
                        alt={species}
                        className="w-full h-full object-contain"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-xs text-center">
                        No image
                    </div>
                )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                #{dexNumber.toString().padStart(4, "0")}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full">
                {species}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap justify-center">
                <TypeBadge type={types[0]} />
                {types[1] !== types[0] && <TypeBadge type={types[1]} />}
            </div>
        </div>
    );
};

// Items per page for pagination
const ITEMS_PER_PAGE = 100;

export const DataPage: React.FC = () => {
    const [search, setSearch] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState("All Types");
    const [page, setPage] = React.useState(0);

    // Compute Pokemon data with types
    const pokemonData = React.useMemo(() => {
        return listOfPokemon.map((species) => ({
            species,
            dexNumber: speciesToNumber(species as Species) || 0,
            types: matchSpeciesToTypes(species as Species),
        }));
    }, []);

    // Filter Pokemon based on search and type
    const filteredPokemon = React.useMemo(() => {
        return pokemonData.filter((pokemon) => {
            const matchesSearch = pokemon.species.toLowerCase().includes(search.toLowerCase());
            const matchesType =
                typeFilter === "All Types" ||
                pokemon.types[0] === typeFilter ||
                pokemon.types[1] === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [pokemonData, search, typeFilter]);

    // Paginated results
    const paginatedPokemon = React.useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return filteredPokemon.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPokemon, page]);

    const totalPages = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(0);
    }, [search, typeFilter]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Pokemon Data</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search Pokemon..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={pokemonTypes}
                    className="w-40"
                />
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredPokemon.length} Pokemon
                </div>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 mb-6">
                {paginatedPokemon.map((pokemon) => (
                    <PokemonCard
                        key={pokemon.species}
                        species={pokemon.species}
                        dexNumber={pokemon.dexNumber}
                        types={pokemon.types}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

