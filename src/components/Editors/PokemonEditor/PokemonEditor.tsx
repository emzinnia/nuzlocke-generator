import React from 'react';
import { Button } from 'components/Common/ui';
import { listOfPokemon } from 'utils/data/listOfPokemon';
import { addPokemonToRun } from 'api/runs';

interface PokemonEditorProps {
    runId: string;
    onPokemonAdded?: () => void;
}

export const PokemonEditor: React.FC<PokemonEditorProps> = ({ runId, onPokemonAdded }) => {
    const [selectedPokemon, setSelectedPokemon] = React.useState('Bulbasaur');
    const [nickname, setNickname] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPokemon(e.target.value);
    };

    const onNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    };

    const handleAddPokemon = async () => {
        setError(null);
        setIsAdding(true);

        try {
            await addPokemonToRun(runId, {
                species: selectedPokemon,
                nickname: nickname || selectedPokemon,
            });

            // Reset form
            setNickname('');

            // Notify parent to refresh data
            onPokemonAdded?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add Pokemon');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Add Pokemon
            </div>

            {error && (
                <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <select
                    value={selectedPokemon}
                    onChange={onChange}
                    disabled={isAdding}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {listOfPokemon.map((pokemon) => (
                        <option key={pokemon} value={pokemon}>
                            {pokemon}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    value={nickname}
                    onChange={onNicknameChange}
                    disabled={isAdding}
                    placeholder="Nickname (optional)"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />

                <Button
                    onClick={handleAddPokemon}
                    variant="primary"
                    disabled={isAdding}
                    className="w-full"
                >
                    {isAdding ? 'Adding...' : 'Add Pokemon'}
                </Button>
            </div>
        </div>
    );
};
