import * as React from "react";
import { connect } from "store/reactZustand";
import {
    Cell,
    Column,
    Table,
    CellRenderer,
    EditableCell,
    JSONFormat,
} from "@blueprintjs/table";
import { State } from "state";
import { generateEmptyPokemon } from "utils";
import { PokemonKeys, Pokemon } from "models";
import { editPokemon as editPokemonType } from "actions";
import { AddPokemonButton } from "components/Pokemon/AddPokemonButton/AddPokemonButton";
import { Button } from "@blueprintjs/core";
import { sortedPokemonSelector } from "selectors";

export interface MassEditorTableProps {
    pokemon: State["pokemon"];
    editPokemon: editPokemonType;
}

type SortDirection = "asc" | "desc";

export interface MassEditorSort {
    key: keyof Pokemon;
    direction: SortDirection;
}

const getSortValue = (pokemon: Pokemon, key: keyof Pokemon): string | number => {
    const value = pokemon[key];

    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "boolean") {
        return value ? 1 : 0;
    }

    if (value == null) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.join(", ").toLocaleLowerCase();
    }

    if (typeof value === "object") {
        return JSON.stringify(value).toLocaleLowerCase();
    }

    return String(value).toLocaleLowerCase();
};

export const sortPokemonForMassEditor = (
    pokemon: Pokemon[],
    sort?: MassEditorSort,
) => {
    if (sort == null) {
        return pokemon;
    }

    const direction = sort.direction === "asc" ? 1 : -1;

    return [...pokemon].sort((a, b) => {
        const aValue = getSortValue(a, sort.key);
        const bValue = getSortValue(b, sort.key);

        if (aValue === bValue) {
            return 0;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
            return (aValue - bValue) * direction;
        }

        return String(aValue).localeCompare(String(bValue)) * direction;
    });
};

const determineCell = (
    key: keyof Pokemon,
    value: unknown,
    id: Pokemon["id"],
    editPokemon: editPokemonType,
) => {
    if (key === "extraData") {
        return (
            <Cell>
                <JSONFormat>{value as object}</JSONFormat>
            </Cell>
        );
    }
    if (key === "id") {
        return <Cell>{id}</Cell>;
    }
    if (key === "checkpoints") {
        return (
            <Cell>
                <JSONFormat>{value as object}</JSONFormat>
            </Cell>
        );
    }
    const displayValue =
        value == null
            ? ""
            : Array.isArray(value)
              ? value.join(", ")
              : typeof value === "string"
                ? value
                : typeof value === "number" || typeof value === "boolean"
                  ? String(value)
                  : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value);
    return (
        <EditableCell
            onConfirm={(value) => {
                let transformedValue: string | string[] = value;
                if (key === "moves" || key === "types") {
                    transformedValue = value?.split(",").map((s) => s.trim());
                }
                editPokemon({ [key]: transformedValue }, id);
            }}
            value={displayValue}
        />
    );
};

const cellRenderer: (
    pokemon: Pokemon[],
    key: keyof Pokemon,
    editPokemon: editPokemonType,
) => CellRenderer =
    (pokemon: Pokemon[], key: string, editPokemon: editPokemonType) =>
    (rowIndex: number) => {
        return determineCell(
            key as keyof Pokemon,
            pokemon[rowIndex][key],
            pokemon[rowIndex].id,
            editPokemon,
        );
    };

const getNextSort = (
    currentSort: MassEditorSort | undefined,
    key: keyof Pokemon,
): MassEditorSort => {
    if (currentSort?.key !== key) {
        return { key, direction: "asc" };
    }

    return {
        key,
        direction: currentSort.direction === "asc" ? "desc" : "asc",
    };
};

export function renderColumns(
    pokemon,
    editPokemon,
    sort?: MassEditorSort,
    setSort?: React.Dispatch<React.SetStateAction<MassEditorSort | undefined>>,
) {
    return Object.keys(PokemonKeys).map((key) => {
        const pokemonKey = key as keyof Pokemon;
        const isSorted = sort?.key === pokemonKey;

        return (
            <Column
                key={key}
                name={key}
                nameRenderer={(name) => (
                    <Button
                        aria-label={`Sort by ${name}`}
                        icon={
                            isSorted
                                ? sort.direction === "asc"
                                    ? "sort-asc"
                                    : "sort-desc"
                                : "sort"
                        }
                        minimal
                        small
                        onClick={() => setSort?.((currentSort) =>
                            getNextSort(currentSort, pokemonKey),
                        )}
                    >
                        {name}
                    </Button>
                )}
                cellRenderer={cellRenderer(
                    pokemon,
                    pokemonKey,
                    editPokemon,
                )}
            />
        );
    });
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
    const [sort, setSort] = React.useState<MassEditorSort | undefined>();
    const sortedPokemon = sortPokemonForMassEditor(pokemon, sort);

    return (
        <>
            <Table numRows={sortedPokemon.length} numFrozenColumns={2}>
                {renderColumns(sortedPokemon, editPokemon, sort, setSort)}
            </Table>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem" }}>
                <AddPokemonButton pokemon={generateEmptyPokemon(pokemon)} />
                <Button
                    icon="download"
                    onClick={() => downloadCSV(sortedPokemon)}
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
