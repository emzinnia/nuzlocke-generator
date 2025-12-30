import * as React from "react";
import { connect } from "react-redux";
import {
    Cell,
    Column,
    Table,
    CellRenderer,
    EditableCell,
    JSONFormat,
} from "components/ui";
import { State } from "state";
import { generateEmptyPokemon, normalizeSpeciesName } from "utils";
import { PokemonKeys, Pokemon } from "models";
import { editPokemon as editPokemonType } from "actions";
import { AddPokemonButton } from "components/Pokemon/AddPokemonButton/AddPokemonButton";
import { Button, Input } from "components/ui/shims";
import { sortedPokemonSelector } from "selectors";
import { Download } from "lucide-react";

export interface MassEditorTableProps {
    pokemon: State["pokemon"];
    editPokemon: editPokemonType;
}

const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const determineCell = (key: keyof Pokemon, value: any, id: string, editPokemon: editPokemonType) => {
    if (key === "extraData" || key === "checkpoints") {
        return (
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-xs max-w-[150px] truncate">
                <pre className="text-xs overflow-hidden text-ellipsis">{formatValue(value)}</pre>
            </td>
        );
    }
    if (key === "id") {
        return (
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-xs text-gray-500">
                {id?.slice(0, 8)}...
            </td>
        );
    }
    return (
        <td className="border border-gray-200 dark:border-gray-700 p-0 text-xs">
            <EditableCell
                value={formatValue(value)}
                onConfirm={(newValue) => {
                    let transformedValue: string | string[] = newValue;
                    if (key === "moves" || key === "types") {
                        transformedValue = newValue?.split(",").map((s) => s.trim());
                    }
                    editPokemon({ [key]: transformedValue }, id);
                }}
            />
        </td>
    );
};

const columns = [...Object.keys(PokemonKeys), "normalizedName"];

const downloadCSV = (pokemon: Pokemon[]) => {
    if (pokemon.length === 0) {
        return;
    }

    // Get all unique keys from all pokemon
    const allKeys = Object.keys(PokemonKeys) as Array<keyof Pokemon>;
    
    // Create CSV header
    const header = allKeys.join(",");
    
    // Create CSV rows
    const rows = pokemon.map((poke) => {
        return allKeys.map((key) => {
            const value = poke[key];
            
            // Handle different data types
            if (value === null || value === undefined) {
                return "";
            }
            
            if (Array.isArray(value)) {
                // Join arrays with semicolons, escape if needed
                const arrayString = value.join(";");
                return `"${arrayString.replace(/"/g, '""')}"`;
            }
            
            if (typeof value === "object") {
                // Stringify objects
                const objString = JSON.stringify(value);
                return `"${objString.replace(/"/g, '""')}"`;
            }
            
            // Escape strings with commas or quotes
            const stringValue = String(value);
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            
            return stringValue;
        }).join(",");
    });
    
    // Combine header and rows
    const csv = [header, ...rows].join("\n");
    
    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `pokemon-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

export function MassEditorTableBase({
    pokemon,
    editPokemon,
}: MassEditorTableProps) {
    return (
        <>
            <div className="overflow-auto max-h-[60vh] border border-gray-200 dark:border-gray-700 rounded">
                <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                        <tr>
                            {columns.map((key) => (
                                <th
                                    key={key}
                                    className="border border-gray-200 dark:border-gray-700 p-1 text-xs font-medium text-left whitespace-nowrap"
                                >
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pokemon.map((poke) => (
                            <tr key={poke.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                {columns.map((key) => {
                                    if (key === "normalizedName") {
                                        return (
                                            <td
                                                key={key}
                                                className="border border-gray-200 dark:border-gray-700 p-1 text-xs"
                                            >
                                                {poke.species ? normalizeSpeciesName(poke.species as any) : ""}
                                            </td>
                                        );
                                    }
                                    return determineCell(
                                        key as keyof Pokemon,
                                        poke[key as keyof Pokemon],
                                        poke.id,
                                        editPokemon
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                <AddPokemonButton pokemon={generateEmptyPokemon(pokemon)} />
                <Button
                    icon={<Download size={16} />}
                    onClick={() => downloadCSV(pokemon)}
                >
                    Download as CSV
                </Button>
            </div>
        </>
    );
}

export const MassEditorTable = connect(
    (state: State) => ({ pokemon: sortedPokemonSelector(state) }),
    {
        editPokemon: editPokemonType,
    },
)(MassEditorTableBase);
