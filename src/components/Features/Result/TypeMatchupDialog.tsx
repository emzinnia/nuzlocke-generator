import * as React from "react";
import { Dialog, Classes, Card } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { PokemonIconPlain } from "components";
import { toggleDialog } from "actions";
import { State } from "state";
import { TypeMatchupSummary } from "./TypeMatchupSummary";
import { getContrastColor, sortPokes } from "utils";

export function TypeMatchupDialog() {
    const dispatch = useDispatch();
    const isOpen = useSelector<State, boolean | undefined>(
        (state) => state.view?.dialogs?.typeMatchups,
    );
    const pokemon = useSelector<State, State["pokemon"]>((state) => state.pokemon);
    const game = useSelector<State, State["game"]>((state) => state.game);
    const style = useSelector<State, State["style"]>((state) => state.style);
    const customTypes = useSelector<State, State["customTypes"]>(
        (state) => state.customTypes,
    );

    const onClose = React.useCallback(
        () => dispatch(toggleDialog("typeMatchups")),
        [dispatch],
    );

    const others = React.useMemo(
        () =>
            pokemon
                ?.filter((p) => p?.status !== "Team" && !p?.hidden)
                .reduce<Record<string, typeof pokemon>>((acc, poke) => {
                    const key = poke.status || "Other";
                    acc[key] = acc[key] ? [...acc[key], poke] : [poke];
                    return acc;
                }, {}),
        [pokemon],
    );

    const textColor = getContrastColor(style?.bgColor ?? "#383840");

    return (
        <Dialog
            icon="layout-group-by"
            isOpen={!!isOpen}
            onClose={onClose}
            title="Type Matchups"
            className={style.editorDarkMode ? Classes.DARK : ""}
            canOutsideClickClose
            style={{ width: "98vw", maxWidth: "1800px" }}
        >
            <div className={Classes.DIALOG_BODY}>
                <div className="type-matchups-layout">
                    <div className="type-matchups-team-preview" style={{ color: textColor }}>
                        <h4>Team Preview</h4>
                        {pokemon
                            ?.filter((p) => p?.status === "Team" && !p?.hidden)
                            .sort(sortPokes)
                            .map((poke) => (
                                <Card
                                    key={poke.id}
                                    className="type-matchups-team-entry"
                                    style={{ borderRadius: "8px" }}
                                >
                                    <PokemonIconPlain
                                        {...poke}
                                        style={{}}
                                        id={poke.id}
                                        species={poke.species}
                                        shiny={poke.shiny}
                                        forme={poke.forme}
                                        gender={poke.gender}
                                        egg={poke.egg}
                                        customIcon={poke.customIcon}
                                        imageStyle={{}}
                                        selectedId=""
                                        onClick={() => {}}
                                    />
                                    <span>
                                        {poke.nickname || poke.species || "Unknown"}
                                    </span>
                                </Card>
                            ))}
                    </div>
                    <div className="type-matchups-main">
                        <TypeMatchupSummary
                            pokemon={pokemon}
                            game={game}
                            customTypes={customTypes}
                            style={style}
                        />
                    </div>
                    <div className="type-matchups-other" style={{ color: textColor, minWidth: "200px", maxWidth: "280px" }}>
                        <h4>Other Pokémon</h4>
                        {!others || !Object.keys(others).length ? (
                            <div>No other Pokémon</div>
                        ) : (
                            Object.entries(others).map(([status, list]) => (
                                <div key={status} className="type-matchups-status">
                                    <div className="type-matchups-status-title">
                                        {status} ({list.length})
                                    </div>
                                    <div className="type-matchups-status-list">
                                        {list.map((poke) => (
                                            <div
                                                key={poke.id}
                                                className="type-matchups-other-entry"
                                            >
                                                <PokemonIconPlain
                                                    {...poke}
                                                    style={{}}
                                                    id={poke.id}
                                                    species={poke.species}
                                                    shiny={poke.shiny}
                                                    forme={poke.forme}
                                                    gender={poke.gender}
                                                    egg={poke.egg}
                                                    customIcon={poke.customIcon}
                                                    imageStyle={{}}
                                                    selectedId=""
                                                    onClick={() => {}}
                                                />
                                                <span>
                                                    {poke.nickname ||
                                                        poke.species ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}


