import * as React from "react";
import { Tooltip, Position } from "components/ui/shims";
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
    matchedIds: Set<string>;
    hasSearchQuery: boolean;
    isDarkMode: boolean;
    selectedId: string;
}

const HIGHLIGHT_COLOR_LIGHT = "#90EE90";
const HIGHLIGHT_COLOR_DARK = "#2e7d32";

const SELECTION_COLOR_LIGHT = "rgba(0, 0, 0, 0.33)";
const SELECTION_COLOR_DARK = "rgba(255, 255, 255, 0.25)";

export class PokemonByFilterBase extends React.PureComponent<PokemonByFilterProps> {
    public render() {
        const { team, status, matchedIds, hasSearchQuery, isDarkMode, selectedId } = this.props;

        const searchHighlightColor = isDarkMode ? HIGHLIGHT_COLOR_DARK : HIGHLIGHT_COLOR_LIGHT;
        const selectionColor = isDarkMode ? SELECTION_COLOR_DARK : SELECTION_COLOR_LIGHT;

        return team
            .sort(sortPokes)
            .filter((poke) => poke.status === status)
            .filter((poke) => !hasSearchQuery || matchedIds.has(poke.id))
            .map((poke) => {
                const isSelected = poke.id === selectedId;
                const isSearchMatch = hasSearchQuery && matchedIds.has(poke.id);

                let backgroundColor: string | undefined;
                if (isSelected) {
                    backgroundColor = selectionColor;
                } else if (isSearchMatch) {
                    backgroundColor = searchHighlightColor;
                }

                return (
                    <Tooltip
                        key={poke.id}
                        content={poke.nickname || poke.species}
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
