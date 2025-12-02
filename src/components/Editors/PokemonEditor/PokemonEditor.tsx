import React from 'react';
import { Button, Field, Select, MultiSelect, Collapsible } from 'components/Common/ui';
import { listOfPokemon } from 'utils/data/listOfPokemon';
import { listOfNatures } from 'utils/data/listOfNatures';
import { listOfAbilities } from 'utils/data/listOfAbilities';
import { movesByType } from 'utils/data/movesByType';
import { Types } from 'utils/Types';
import { addPokemonToRun } from 'api/runs';

// Flatten all moves from movesByType into a single sorted array
const allMoves = Array.from(
    new Set(Object.values(movesByType).flat())
).sort();

// Get Pokemon types (excluding TemTem types)
const pokemonTypes = [
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

const genderOptions = ['Male', 'Female', 'Neutral'];

const defaultStatusOptions = ['Team', 'Dead', 'Boxed', 'Champs'];

interface PokemonEditorProps {
    runId: string;
    onPokemonAdded?: () => void;
}

export const PokemonEditor: React.FC<PokemonEditorProps> = ({ runId, onPokemonAdded }) => {
    const [selectedPokemon, setSelectedPokemon] = React.useState('Bulbasaur');
    const [nickname, setNickname] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [customStatuses, setCustomStatuses] = React.useState<string[]>([]);
    const [isAddingCustomStatus, setIsAddingCustomStatus] = React.useState(false);
    const [newCustomStatus, setNewCustomStatus] = React.useState('');
    const [level, setLevel] = React.useState<number | ''>('');
    const [metLocation, setMetLocation] = React.useState('');
    const [metLevel, setMetLevel] = React.useState<number | ''>('');
    const [gender, setGender] = React.useState('');
    const [nature, setNature] = React.useState('');
    const [ability, setAbility] = React.useState('');
    const [moves, setMoves] = React.useState<string[]>([]);
    const [types, setTypes] = React.useState<string[]>([]);
    const [isAdding, setIsAdding] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const allStatusOptions = [...defaultStatusOptions, ...customStatuses];

    const handleStatusChange = (value: string) => {
        if (value === '__add_custom__') {
            setIsAddingCustomStatus(true);
        } else {
            setStatus(value);
        }
    };

    const handleAddCustomStatus = () => {
        if (newCustomStatus.trim() && !allStatusOptions.includes(newCustomStatus.trim())) {
            setCustomStatuses([...customStatuses, newCustomStatus.trim()]);
            setStatus(newCustomStatus.trim());
        }
        setNewCustomStatus('');
        setIsAddingCustomStatus(false);
    };

    const resetForm = () => {
        setNickname('');
        setStatus('');
        setLevel('');
        setMetLocation('');
        setMetLevel('');
        setGender('');
        setNature('');
        setAbility('');
        setMoves([]);
        setTypes([]);
    };

    const handleAddPokemon = async () => {
        setError(null);
        setIsAdding(true);

        try {
            await addPokemonToRun(runId, {
                species: selectedPokemon,
                nickname: nickname || selectedPokemon,
                status: status || undefined,
                level: level || undefined,
                met: metLocation || undefined,
                metLevel: metLevel || undefined,
                gender: gender as 'Male' | 'Female' | 'Neutral' | undefined,
                nature: nature || undefined,
                ability: ability || undefined,
                moves: moves.length > 0 ? moves : undefined,
                types: types.length > 0 ? types : undefined,
            });

            resetForm();
            onPokemonAdded?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add Pokemon');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Collapsible title="Add Pokemon" defaultOpen={true}>
            {error && (
                <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {/* Species */}
                <Select
                    value={selectedPokemon}
                    onChange={(e) => setSelectedPokemon(e.target.value)}
                    disabled={isAdding}
                    options={listOfPokemon}
                    className="w-full"
                />

                {/* Nickname */}
                <Field
                    label="Nickname"
                    inputProps={{
                        type: "text",
                        value: nickname,
                        onChange: (e) => setNickname(e.target.value),
                        placeholder: "Nickname (optional)",
                        disabled: isAdding,
                    }}
                />

                {/* Status */}
                <div className="flex gap-1 w-full justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    {isAddingCustomStatus ? (
                        <div className="flex-1 ml-2 flex gap-1">
                            <input
                                type="text"
                                value={newCustomStatus}
                                onChange={(e) => setNewCustomStatus(e.target.value)}
                                placeholder="New status..."
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomStatus()}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomStatus}
                                className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsAddingCustomStatus(false); setNewCustomStatus(''); }}
                                className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <Select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={isAdding}
                            options={[
                                { value: '', label: 'Select...' },
                                ...allStatusOptions.map(s => ({ value: s, label: s })),
                                { value: '__add_custom__', label: '+ Add custom...' }
                            ]}
                            className="flex-1 ml-2"
                        />
                    )}
                </div>

                {/* Level */}
                <Field
                    label="Level"
                    inputProps={{
                        type: "number",
                        min: 1,
                        value: level,
                        onChange: (e) => setLevel(e.target.value ? parseInt(e.target.value) : ''),
                        placeholder: "1-100",
                        disabled: isAdding,
                    }}
                />

                {/* Met Location */}
                <Field
                    label="Met Location"
                    inputProps={{
                        type: "text",
                        value: metLocation,
                        onChange: (e) => setMetLocation(e.target.value),
                        placeholder: "Where caught",
                        disabled: isAdding,
                    }}
                />

                {/* Met Level */}
                <Field
                    label="Met Level"
                    inputProps={{
                        type: "number",
                        min: 1,
                        value: metLevel,
                        onChange: (e) => setMetLevel(e.target.value ? parseInt(e.target.value) : ''),
                        placeholder: "1-100",
                        disabled: isAdding,
                    }}
                />

                {/* Gender */}
                <div className="flex gap-1 w-full justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={isAdding}
                        options={[{ value: '', label: 'Select...' }, ...genderOptions.map(g => ({ value: g, label: g }))]}
                        className="flex-1 ml-2"
                    />
                </div>

                {/* Nature */}
                <div className="flex gap-1 w-full justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nature</label>
                    <Select
                        value={nature}
                        onChange={(e) => setNature(e.target.value)}
                    disabled={isAdding}
                        options={[{ value: '', label: 'Select...' }, ...listOfNatures.map(n => ({ value: n, label: n }))]}
                        className="flex-1 ml-2"
                    />
                </div>

                {/* Ability */}
                <div className="flex gap-1 w-full justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ability</label>
                    <Select
                        value={ability}
                        onChange={(e) => setAbility(e.target.value)}
                        disabled={isAdding}
                        options={[{ value: '', label: 'Select...' }, ...listOfAbilities.map(a => ({ value: a, label: a }))]}
                        className="flex-1 ml-2"
                    />
                </div>

                {/* Moves */}
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Moves (max 4)
                    </label>
                    <MultiSelect
                        options={allMoves}
                        value={moves}
                        onChange={setMoves}
                        max={4}
                        placeholder="Add move..."
                        disabled={isAdding}
                    />
                </div>

                {/* Types */}
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Types (max 2)
                    </label>
                    <MultiSelect
                        options={pokemonTypes}
                        value={types}
                        onChange={setTypes}
                        max={2}
                        placeholder="Add type..."
                        disabled={isAdding}
                    />
                </div>

                <Button
                    onClick={handleAddPokemon}
                    variant="primary"
                    disabled={isAdding}
                    className="w-full"
                >
                    {isAdding ? 'Adding...' : 'Add Pokemon'}
                </Button>
            </div>
        </Collapsible>
    );
};
