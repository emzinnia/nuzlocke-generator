import React from 'react';
import { Collapsible } from 'components/Common/ui';
import { getRun } from 'api/runs';
import type { Pokemon } from 'models/Pokemon';

interface PokemonBoxesProps {
    runId: string;
    onRefresh?: () => void;
    selectedPokemonId?: string | null;
    onSelectPokemon?: (id: string | null) => void;
    onPokemonLoaded?: (pokemon: Pokemon[]) => void;
}

// Normalize species name for icon URL (simplified version)
const normalizeSpeciesName = (species: string): string => {
    if (!species) return 'unknown';
    if (species === 'Nidoran♀') return 'nidoran-f';
    if (species === 'Nidoran♂') return 'nidoran-m';
    if (species === 'Mr. Mime') return 'mr-mime';
    if (species === 'Mr. Rime') return 'mr-rime';
    if (species.startsWith('Farfetch')) return 'farfetchd';
    if (species.startsWith('Sirfetch')) return 'sirfetchd';
    if (species === 'Mime Jr.') return 'mime-jr';
    if (species === 'Flabébé') return 'flabebe';
    if (species === 'Type: Null') return 'type-null';
    return species.toLowerCase().replace(/\s/g, '-').replace(/'/g, '');
};

const getIconURL = (species: string, shiny?: boolean): string => {
    const baseURL = 'icons/pokemon/';
    const variant = shiny ? 'shiny' : 'regular';
    return `${baseURL}${variant}/${normalizeSpeciesName(species)}.png`;
};

// Pokemon icon component for the boxes display
const PokemonIconSmall: React.FC<{
    pokemon: Pokemon;
    isSelected?: boolean;
    onClick?: () => void;
}> = ({ pokemon, isSelected, onClick }) => {
    const [imageError, setImageError] = React.useState(false);

    return (
        <div
            className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded transition-colors ${
                isSelected
                    ? 'bg-blue-200 dark:bg-blue-700 ring-2 ring-blue-500'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={pokemon.nickname || pokemon.species}
            onClick={onClick}
        >
            {!imageError ? (
                <img
                    src={getIconURL(pokemon.species, pokemon.shiny)}
                    alt={pokemon.species}
                    className="w-8 h-8 object-contain"
                    onError={() => setImageError(true)}
                    style={{ imageRendering: 'pixelated' }}
                />
            ) : (
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    ?
                </div>
            )}
        </div>
    );
};

// Status group component
const StatusGroup: React.FC<{
    status: string;
    pokemon: Pokemon[];
    selectedPokemonId?: string | null;
    onSelectPokemon?: (id: string | null) => void;
}> = ({ status, pokemon, selectedPokemonId, onSelectPokemon }) => {
    if (pokemon.length === 0) return null;

    const statusColors: Record<string, string> = {
        'Team': 'text-green-600 dark:text-green-400',
        'Dead': 'text-red-600 dark:text-red-400',
        'Boxed': 'text-blue-600 dark:text-blue-400',
        'Champs': 'text-yellow-600 dark:text-yellow-400',
    };

    const colorClass = statusColors[status] || 'text-gray-600 dark:text-gray-400';

    return (
        <div className="mb-3">
            <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${colorClass}`}>
                {status} ({pokemon.length})
            </div>
            <div className="flex flex-wrap gap-0.5 bg-gray-100 dark:bg-gray-700/50 rounded p-1">
                {pokemon.map((p) => (
                    <PokemonIconSmall
                        key={p.id}
                        pokemon={p}
                        isSelected={selectedPokemonId === p.id}
                        onClick={() => onSelectPokemon?.(selectedPokemonId === p.id ? null : p.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export const PokemonBoxes: React.FC<PokemonBoxesProps> = ({ runId, onRefresh, selectedPokemonId, onSelectPokemon, onPokemonLoaded }) => {
    const [pokemon, setPokemon] = React.useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchPokemon = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const run = await getRun(runId);
            const loadedPokemon = (run.data.pokemon as Pokemon[]) || [];
            setPokemon(loadedPokemon);
            onPokemonLoaded?.(loadedPokemon);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Pokemon');
        } finally {
            setIsLoading(false);
        }
    }, [runId, onPokemonLoaded]);

    React.useEffect(() => {
        fetchPokemon();
    }, [fetchPokemon]);

    // Re-fetch when onRefresh changes (triggered by parent)
    React.useEffect(() => {
        if (onRefresh) {
            fetchPokemon();
        }
    }, [onRefresh, fetchPokemon]);

    // Group Pokemon by status
    const groupedPokemon = React.useMemo(() => {
        const groups: Record<string, Pokemon[]> = {};
        
        // Define order for known statuses
        const statusOrder = ['Team', 'Boxed', 'Dead', 'Champs'];
        
        // Initialize known status groups
        statusOrder.forEach(status => {
            groups[status] = [];
        });
        
        // Group Pokemon
        pokemon.forEach((p) => {
            const status = p.status || 'Boxed'; // Default to Boxed if no status
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(p);
        });
        
        // Return ordered groups (known statuses first, then custom)
        const orderedGroups: { status: string; pokemon: Pokemon[] }[] = [];
        
        statusOrder.forEach(status => {
            if (groups[status]?.length > 0) {
                orderedGroups.push({ status, pokemon: groups[status] });
            }
        });
        
        // Add any custom statuses
        Object.keys(groups).forEach(status => {
            if (!statusOrder.includes(status) && groups[status]?.length > 0) {
                orderedGroups.push({ status, pokemon: groups[status] });
            }
        });
        
        return orderedGroups;
    }, [pokemon]);

    if (isLoading) {
        return (
            <Collapsible title="Boxes" defaultOpen={true}>
                <div className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Loading...
                </div>
            </Collapsible>
        );
    }

    if (error) {
        return (
            <Collapsible title="Boxes" defaultOpen={true}>
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            </Collapsible>
        );
    }

    if (pokemon.length === 0) {
        return (
            <Collapsible title="Boxes" defaultOpen={true}>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No Pokemon yet. Add some below!
                </div>
            </Collapsible>
        );
    }

    return (
        <Collapsible title={`Boxes (${pokemon.length})`} defaultOpen={true}>
            {groupedPokemon.map(({ status, pokemon: groupPokemon }) => (
                <StatusGroup
                    key={status}
                    status={status}
                    pokemon={groupPokemon}
                    selectedPokemonId={selectedPokemonId}
                    onSelectPokemon={onSelectPokemon}
                />
            ))}
        </Collapsible>
    );
};

