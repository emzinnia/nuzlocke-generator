import * as React from "react";
import { Button, Tooltip, Position } from "@blueprintjs/core";
import { Pokemon } from "models";
import { PokemonIcon } from "components/Pokemon/PokemonIcon";
import { sortPokes } from "utils";
import { connect } from "store/reactZustand";
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
    /** Currently selected Pokémon ID (from Redux) */
    selectedId: string;
}

// Highlight colors for matched Pokémon
const HIGHLIGHT_COLOR_LIGHT = "#90EE90"; // Light green
const HIGHLIGHT_COLOR_DARK = "#2e7d32"; // Darker green for dark mode

// Selection highlight (transparent dark circle)
const SELECTION_COLOR_LIGHT = "rgba(0, 0, 0, 0.33)";
const SELECTION_COLOR_DARK = "rgba(255, 255, 255, 0.25)";

export class PokemonByFilterBase extends React.PureComponent<PokemonByFilterProps> {
    private levelUpPokemon = (poke: Pokemon) => (
        event: React.MouseEvent<HTMLElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const level = Number.parseInt(String(poke.level ?? "0"), 10);

        this.props.editPokemon(
            {
                level: (Number.isNaN(level) ? 0 : level) + 1,
            },
            poke.id,
        );
    };

    public render() {
        const { team, status, matchedIds, hasSearchQuery, isDarkMode, selectedId } = this.props;

        const searchHighlightColor = isDarkMode ? HIGHLIGHT_COLOR_DARK : HIGHLIGHT_COLOR_LIGHT;
        const selectionColor = isDarkMode ? SELECTION_COLOR_DARK : SELECTION_COLOR_LIGHT;

        return team
            .sort(sortPokes)
            .filter((poke) => poke.status === status)
            // Filter by search results when there's an active query
            .filter((poke) => !hasSearchQuery || matchedIds.has(poke.id))
            .map((poke) => {
                const isSelected = poke.id === selectedId;
                const isSearchMatch = hasSearchQuery && matchedIds.has(poke.id);

                // Determine background color: selection takes priority over search highlight
                let backgroundColor: string | undefined;
                if (isSelected) {
                    backgroundColor = selectionColor;
                } else if (isSearchMatch) {
                    backgroundColor = searchHighlightColor;
                }

                const displayName = poke.nickname || poke.species || "Pokemon";

                return (
                    <span
                        key={poke.id}
                        style={{
                            alignItems: "center",
                            display: "inline-flex",
                            gap: "0.125rem",
                        }}
                    >
                        <Tooltip
                            content={displayName}
                            position={Position.TOP}
                        >
                            <PokemonIcon
                                style={
                                    backgroundColor
                                        ? {
                                              backgroundColor,
                                              borderRadius: "50%",
                                          }
                                        : undefined
                                }
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
                        <Tooltip
                            content={`Level up ${displayName}`}
                            position={Position.TOP}
                        >
                            <Button
                                aria-label={`Level up ${displayName}`}
                                icon="plus"
                                minimal
                                small
                                onClick={this.levelUpPokemon(poke)}
                            />
                        </Tooltip>
                    </span>
                );
            });
    }
}

export const PokemonByFilter = connect(
    (state: State) => ({
        isDarkMode: state.style.editorDarkMode ?? false,
        selectedId: state.selectedId,
    }),
    {
        editPokemon,
    },
)(PokemonByFilterBase);
