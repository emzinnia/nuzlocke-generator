import React from "react";
import {
    Button,
    Field,
    Select,
    MultiSelect,
    Collapsible,
} from "components/Common/ui";
import { listOfPokemon } from "utils/data/listOfPokemon";
import { listOfNatures } from "utils/data/listOfNatures";
import { listOfAbilities } from "utils/data/listOfAbilities";
import { movesByType } from "utils/data/movesByType";
import { Types } from "utils/Types";
import { getListOfTypes } from "utils/Types";
import { addPokemonToRun, patchRunWithHistory } from "api/runs";
import type { Pokemon } from "models/Pokemon";
import { debounce } from "utils/debounce";
import { PokemonIconPlain } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { DeletePokemonButton } from "components/Pokemon/DeletePokemonButton/DeletePokemonButton";
import { Label } from "components/Common/ui/Label";

const allMoves = Array.from(new Set(Object.values(movesByType).flat())).sort();

const genderOptions = ["Male", "Female", "Neutral"];

const defaultStatusOptions = ["Team", "Dead", "Boxed", "Champs"];

interface PokemonEditorProps {
    runId: string;
    onPokemonAdded?: () => void;
    selectedPokemonId?: string | null;
    pokemonList?: Pokemon[];
    onClearSelection?: () => void;
}

export const PokemonEditor: React.FC<PokemonEditorProps> = ({
    runId,
    onPokemonAdded,
    selectedPokemonId,
    pokemonList,
    onClearSelection,
}) => {
    const [selectedPokemon, setSelectedPokemon] = React.useState("Bulbasaur");
    const [nickname, setNickname] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [customStatuses, setCustomStatuses] = React.useState<string[]>([]);
    const [isAddingCustomStatus, setIsAddingCustomStatus] =
        React.useState(false);
    const [newCustomStatus, setNewCustomStatus] = React.useState("");
    const [level, setLevel] = React.useState<number | "">("");
    const [metLocation, setMetLocation] = React.useState("");
    const [metLevel, setMetLevel] = React.useState<number | "">("");
    const [gender, setGender] = React.useState("");
    const [nature, setNature] = React.useState("");
    const [ability, setAbility] = React.useState("");
    const [moves, setMoves] = React.useState<string[]>([]);
    const [types, setTypes] = React.useState<string[]>([]);
    const [isAdding, setIsAdding] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const isEditMode = Boolean(selectedPokemonId);
    const currentPokemon = pokemonList?.find((p) => p.id === selectedPokemonId);

    React.useEffect(() => {
        if (currentPokemon) {
            setSelectedPokemon(currentPokemon.species || "Bulbasaur");
            setNickname(currentPokemon.nickname || "");
            setStatus(currentPokemon.status || "");
            setLevel(currentPokemon.level ?? "");
            setMetLocation(currentPokemon.met || "");
            setMetLevel(currentPokemon.metLevel ?? "");
            setGender(currentPokemon.gender || "");
            setNature(currentPokemon.nature || "");
            setAbility(currentPokemon.ability || "");
            setMoves(currentPokemon.moves || []);
            setTypes((currentPokemon.types as string[]) || []);
        }
    }, [currentPokemon]);

    const saveEditedPokemon = React.useMemo(
        () =>
            debounce(async (updatedPokemon: Partial<Pokemon>) => {
                if (!selectedPokemonId || !pokemonList) return;
                setIsSaving(true);
                try {
                    const updatedList = pokemonList.map((p) =>
                        p.id === selectedPokemonId
                            ? { ...p, ...updatedPokemon }
                            : p
                    );
                    await patchRunWithHistory(runId, { pokemon: updatedList });
                    onPokemonAdded?.();
                } catch (err) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to save Pokemon"
                    );
                } finally {
                    setIsSaving(false);
                }
            }, 500),
        [runId, selectedPokemonId, pokemonList, onPokemonAdded]
    );

    const updateField = (field: keyof Pokemon, value: unknown) => {
        if (isEditMode && currentPokemon) {
            saveEditedPokemon({ [field]: value });
        }
    };

    const allStatusOptions = [...defaultStatusOptions, ...customStatuses];

    const handleStatusChange = (value: string) => {
        if (value === "__add_custom__") {
            setIsAddingCustomStatus(true);
        } else {
            setStatus(value);
        }
    };

    const handleAddCustomStatus = () => {
        if (
            newCustomStatus.trim() &&
            !allStatusOptions.includes(newCustomStatus.trim())
        ) {
            setCustomStatuses([...customStatuses, newCustomStatus.trim()]);
            setStatus(newCustomStatus.trim());
        }
        setNewCustomStatus("");
        setIsAddingCustomStatus(false);
    };

    const resetForm = () => {
        setNickname("");
        setStatus("");
        setLevel("");
        setMetLocation("");
        setMetLevel("");
        setGender("");
        setNature("");
        setAbility("");
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
                gender: gender as "Male" | "Female" | "Neutral" | undefined,
                nature: nature || undefined,
                ability: ability || undefined,
                moves: moves.length > 0 ? moves : undefined,
                types: types.length > 0 ? types : undefined,
            });

            resetForm();
            onPokemonAdded?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to add Pokemon"
            );
        } finally {
            setIsAdding(false);
        }
    };

    const title = isEditMode
        ? isSaving
            ? `Editing ${
                  currentPokemon?.nickname || currentPokemon?.species
              } (Saving...)`
            : `Editing ${currentPokemon?.nickname || currentPokemon?.species}`
        : "Add Pokemon";

    const isDisabled = isEditMode ? isSaving : isAdding;

    return (
        <Collapsible title={title} defaultOpen={true}>
            {error && (
                <div className="mb-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error}
                </div>
            )}

            {isEditMode && (
                <button
                    type="button"
                    onClick={onClearSelection}
                    className="mb-3 w-full text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back to Add Pokemon
                </button>
            )}

            <div className="space-2 grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 col-span-2">
                    <div className="flex flex-col gap-1 text-left">
                        <Label>Species</Label>
                        <PokemonIconPlain
                            species={selectedPokemon}
                            forme={currentPokemon?.forme}
                            shiny={currentPokemon?.shiny}
                            gender={currentPokemon?.gender}
                            customIcon={currentPokemon?.customIcon}
                            egg={currentPokemon?.egg}
                            selectedId={null}
                            onClick={() => {}}
                            imageStyle={{
                                height: "32px",
                                maxWidth: "auto",
                            }}
                        />
                    </div>
                    <Select
                        value={selectedPokemon}
                        onChange={(e) => {
                            setSelectedPokemon(e.target.value);
                            updateField("species", e.target.value);
                        }}
                        disabled={isDisabled}
                        options={listOfPokemon}
                        className="flex-1"
                    />
                    <DeletePokemonButton
                        pokemonId={selectedPokemonId ?? undefined}
                        runId={runId}
                        pokemonList={pokemonList ?? []}
                        onDeleted={() => {
                            onClearSelection?.();
                            onPokemonAdded?.();
                        }}
                    />
                </div>

                <Field
                    label="Nickname"
                    className="flex flex-col gap-1 text-left"
                    inputProps={{
                        type: "text",
                        value: nickname,
                        onChange: (e) => {
                            setNickname(e.target.value);
                            updateField("nickname", e.target.value);
                        },
                        placeholder: "Nickname (optional)",
                        disabled: isDisabled,
                    }}
                />

                <div className="flex gap-1 w-full justify-between items-start flex-col">
                    <Label>Status</Label>
                    {isAddingCustomStatus ? (
                        <div className="flex-1 flex gap-1">
                            <input
                                type="text"
                                value={newCustomStatus}
                                onChange={(e) =>
                                    setNewCustomStatus(e.target.value)
                                }
                                placeholder="New status..."
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCustomStatus()
                                }
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
                                onClick={() => {
                                    setIsAddingCustomStatus(false);
                                    setNewCustomStatus("");
                                }}
                                className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <Select
                            value={status}
                            onChange={(e) => {
                                handleStatusChange(e.target.value);
                                if (e.target.value !== "__add_custom__") {
                                    updateField("status", e.target.value);
                                }
                            }}
                            disabled={isDisabled}
                            options={[
                                { value: "", label: "Select..." },
                                ...allStatusOptions.map((s) => ({
                                    value: s,
                                    label: s,
                                })),
                                {
                                    value: "__add_custom__",
                                    label: "+ Add custom...",
                                },
                            ]}
                            className="flex-1"
                        />
                    )}
                </div>

                <Field
                    className="flex flex-col gap-1 text-left"
                    label="Level"
                    inputProps={{
                        type: "number",
                        min: 1,
                        value: level,
                        onChange: (e) => {
                            const val = e.target.value
                                ? parseInt(e.target.value)
                                : "";
                            setLevel(val);
                            updateField("level", val || undefined);
                        },
                        placeholder: "1-100",
                        disabled: isDisabled,
                    }}
                />

                <Field
                    className="flex flex-col gap-1 text-left"
                    label="Met Location"
                    inputProps={{
                        type: "text",
                        value: metLocation,
                        onChange: (e) => {
                            setMetLocation(e.target.value);
                            updateField("met", e.target.value);
                        },
                        placeholder: "Where caught",
                        disabled: isDisabled,
                    }}
                />

                <Field
                    className="flex flex-col gap-1 text-left"
                    label="Met Level"
                    inputProps={{
                        type: "number",
                        min: 1,
                        value: metLevel,
                        onChange: (e) => {
                            const val = e.target.value
                                ? parseInt(e.target.value)
                                : "";
                            setMetLevel(val);
                            updateField("metLevel", val || undefined);
                        },
                        placeholder: "1-100",
                        disabled: isDisabled,
                    }}
                />

                <div className="flex gap-1 w-full justify-between items-start flex-col">
                    <Label>Gender</Label>
                    <Select
                        value={gender}
                        onChange={(e) => {
                            setGender(e.target.value);
                            updateField("gender", e.target.value || undefined);
                        }}
                        disabled={isDisabled}
                        options={[
                            { value: "", label: "Select..." },
                            ...genderOptions.map((g) => ({
                                value: g,
                                label: g,
                            })),
                        ]}
                        className="flex-1 w-full"
                    />
                </div>

                <div className="flex gap-1 w-full justify-between items-start flex-col">
                    <Label>Nature</Label>
                    <Select
                        value={nature}
                        onChange={(e) => {
                            setNature(e.target.value);
                            updateField("nature", e.target.value || undefined);
                        }}
                        disabled={isDisabled}
                        options={[
                            { value: "", label: "Select..." },
                            ...listOfNatures.map((n) => ({
                                value: n,
                                label: n,
                            })),
                        ]}
                        className="flex-1 w-full"
                    />
                </div>

                <div className="flex gap-1 w-full justify-between items-start flex-col">
                    <Label>Ability</Label>
                    <Select
                        value={ability}
                        onChange={(e) => {
                            setAbility(e.target.value);
                            updateField("ability", e.target.value || undefined);
                        }}
                        disabled={isDisabled}
                        options={[
                            { value: "", label: "Select..." },
                            ...listOfAbilities.map((a) => ({
                                value: a,
                                label: a,
                            })),
                        ]}
                        className="flex-1 w-full"
                    />
                </div>

                <div className="flex flex-col gap-1 text-left">
                    <Label>Types (max 2)</Label>
                    <MultiSelect
                        options={getListOfTypes([])}
                        value={types}
                        onChange={(newTypes) => {
                            setTypes(newTypes);
                            updateField(
                                "types",
                                newTypes.length > 0 ? newTypes : undefined
                            );
                        }}
                        max={2}
                        placeholder="Add type..."
                        disabled={isDisabled}
                    />
                </div>

                <div className="flex flex-col gap-1 text-left col-span-3">
                    <Label>Moves (max 4)</Label>
                    <MultiSelect
                        options={allMoves as string[]}
                        value={moves}
                        onChange={(newMoves) => {
                            setMoves(newMoves);
                            updateField(
                                "moves",
                                newMoves.length > 0 ? newMoves : undefined
                            );
                        }}
                        max={4}
                        placeholder="Add move..."
                        disabled={isDisabled}
                    />
                </div>

                {!isEditMode && (
                    <Button
                        onClick={handleAddPokemon}
                        variant="primary"
                        disabled={isAdding}
                        className="w-full"
                    >
                        {isAdding ? "Adding..." : "Add Pokemon"}
                    </Button>
                )}
            </div>
        </Collapsible>
    );
};
