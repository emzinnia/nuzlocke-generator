import * as React from "react";
import { Tooltip, Position } from "@blueprintjs/core";
import { Pokemon } from "models";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { sortPokes } from "utils";
import { connect } from "react-redux";
import { editPokemon } from "actions";
import { State } from "state";

export interface PokemonByFilterProps {
    team: Pokemon[];
    status: string;
    editPokemon: editPokemon;
    searchTerm: string;
    /** Set of Pokémon IDs that match the current search query */
    matchedIds: Set<string>;
    /** Whether there is an active search query */
    hasSearchQuery: boolean;
    /** Whether dark mode is enabled (from Redux) */
    isDarkMode: boolean;
}

// Highlight colors for matched Pokémon
const HIGHLIGHT_COLOR_LIGHT = "#90EE90"; // Light green
const HIGHLIGHT_COLOR_DARK = "#2e7d32"; // Darker green for dark mode

export class PokemonByFilterBase extends React.PureComponent<PokemonByFilterProps> {
    public render() {
        const { team, status, matchedIds, hasSearchQuery, isDarkMode } = this.props;

        const highlightColor = isDarkMode ? HIGHLIGHT_COLOR_DARK : HIGHLIGHT_COLOR_LIGHT;

        return team
            .sort(sortPokes)
            .filter((poke) => poke.status === status)
            // Filter by search results when there's an active query
            .filter((poke) => !hasSearchQuery || matchedIds.has(poke.id))
            .map((poke) => (
                <Tooltip
                    key={poke.id}
                    content={poke.nickname || poke.species}
                    position={Position.TOP}
                >
                    <PokemonIcon
                        style={{
                            // Highlight matched Pokémon when searching
                            backgroundColor:
                                hasSearchQuery && matchedIds.has(poke.id)
                                    ? highlightColor
                                    : undefined,
                            borderRadius: "50%",
                        }}
                        id={poke.id}
                        status={poke.status}
                        species={poke.species}
                        forme={poke.forme}
                        shiny={poke.shiny}
                        gender={poke.gender}
                        customIcon={poke.customIcon}
                        hidden={poke.hidden}
                        position={poke.position}
                        egg={poke.egg}
                    />
                </Tooltip>
            ));
    }
}

export const PokemonByFilter = connect(
    (state: State) => ({
        isDarkMode: state.style.editorDarkMode ?? false,
    }),
    {
        editPokemon,
    },
)(PokemonByFilterBase);
