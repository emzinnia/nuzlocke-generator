import * as React from "react";
import { connect } from "react-redux";
import {
    Cell,
    Column,
    Table,
    CellRenderer,
    EditableCell,
    JSONFormat,
} from "@blueprintjs/table";
import { State } from "state";
import { sortPokes, generateEmptyPokemon, normalizeSpeciesName } from "utils";
import { PokemonKeys, Pokemon } from "models";
import { editPokemon as editPokemonType } from "actions";
import { AddPokemonButton } from "components/Pokemon/AddPokemonButton/AddPokemonButton";
import { Button } from "@blueprintjs/core";

export interface MassEditorTableProps {
    pokemon: State["pokemon"];
    editPokemon: editPokemonType;
}

const determineCell = (key: keyof Pokemon, value: any, id, editPokemon) => {
    if (key === "extraData") {
        return (
            <Cell>
                <JSONFormat>{value}</JSONFormat>
            </Cell>
        );
    }
    if (key === "id") {
        return <Cell>{id}</Cell>;
    }
    if (key === "checkpoints") {
        return (
            <Cell>
                <JSONFormat>{value}</JSONFormat>
            </Cell>
        );
    }
    return (
        <EditableCell
            onConfirm={(value) => {
                let transformedValue: string | string[] = value;
                if (key === "moves" || key === "types") {
                    transformedValue = value?.split(",").map((s) => s.trim());
                }
                editPokemon({ [key]: transformedValue }, id);
            }}
            value={value}
        />
    );
};

const cellRenderer: (
    pokemon: Pokemon[],
    key: keyof Pokemon,
    editPokemon,
) => CellRenderer =
    (pokemon: Pokemon[], key: string, editPokemon) => (rowIndex: number) => {
        return determineCell(
            key as keyof Pokemon,
            pokemon[rowIndex][key],
            pokemon[rowIndex].id,
            editPokemon,
        );
    };

export function renderColumns(pokemon, editPokemon) {
    const standardColumns = Object.keys(PokemonKeys).map((key) => {
        return (
            // @ts-expect-error react return type nonsense
            <Column
                key={key}
                name={key}
                cellRenderer={cellRenderer(
                    pokemon,
                    key as keyof Pokemon,
                    editPokemon,
                )}
            />
        );
    });

    const normalizedNameColumn = (
        <Column
            key="normalizedName"
            name="normalizedName"
            cellRenderer={(rowIndex: number) => {
                const species = pokemon[rowIndex]?.species;
                const normalized = species ? normalizeSpeciesName(species as any) : "";
                return <Cell>{normalized}</Cell>;
            }}
        />
    );

    return [...standardColumns, normalizedNameColumn];
}

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
            <Table numRows={pokemon.length} numFrozenColumns={2}>
                {renderColumns(pokemon, editPokemon)}
            </Table>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                <AddPokemonButton pokemon={generateEmptyPokemon(pokemon)} />
                <Button
                    icon="download"
                    onClick={() => downloadCSV(pokemon)}
                >
                    Download as CSV
                </Button>
            </div>
        </>
    );
}

export const MassEditorTable = connect(
    (state: State) => ({ pokemon: state.pokemon.sort(sortPokes) }),
    {
        editPokemon: editPokemonType,
    },
)(MassEditorTableBase);
