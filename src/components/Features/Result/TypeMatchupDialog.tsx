import * as React from "react";
import { Dialog, Classes, Card } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { PokemonIconPlain } from "components";
import { toggleDialog } from "actions";
import { State } from "state";
import { TypeMatchupSummary } from "./TypeMatchupSummary";
import { sortPokes } from "utils";
import * as styles from "./TypeMatchupDialog.styles";

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

    const sortedOthers = React.useMemo(
        () =>
            others
                ? Object.entries(others)
                      .map(([status, list]) => [status, [...list].sort(sortPokes)] as const)
                      .sort(([a], [b]) => a.localeCompare(b))
                : [],
        [others],
    );

    // Use dark mode setting for proper text contrast in dialog
    const textColor = style?.editorDarkMode ? "#F5F8FA" : "#182026";

    return (
        <Dialog
            icon="layout-group-by"
            isOpen={!!isOpen}
            onClose={onClose}
            title="Type Matchups"
            className={style.editorDarkMode ? Classes.DARK : "bp-3-dark"}
            canOutsideClickClose
            style={{ width: "98vw", maxWidth: "112.5rem" }}
        >
            <div className={Classes.DIALOG_BODY}>
                <div className={styles.typeMatchupsLayout}>
                    <div className={styles.typeMatchupsTeamPreview} style={{ color: textColor }}>
                        <h4>Team Preview</h4>
                        <p>Select a Pokémon to swap it out from type matchups.</p>
                        {pokemon
                            ?.filter((p) => p?.status === "Team" && !p?.hidden)
                            .sort(sortPokes)
                            .map((poke) => (
                                <Card
                                    key={poke.id}
                                    className={styles.typeMatchupsTeamEntry}
                                    style={{ borderRadius: "0.5rem" }}
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
                    <div className={styles.typeMatchupsMain}>
                        <TypeMatchupSummary
                            pokemon={pokemon}
                            game={game}
                            customTypes={customTypes}
                            style={style}
                        />
                    </div>
                    <div
                        className={styles.typeMatchupsOther}
                        style={{ color: textColor, minWidth: "12.5rem", maxWidth: "17.5rem" }}
                    >
                        <h4>Other Pokémon</h4>
                        {!sortedOthers.length ? (
                            <div>No other Pokémon</div>
                        ) : (
                            sortedOthers.map(([status, list]) => (
                                <div key={status} className={styles.typeMatchupsStatus}>
                                    <div className={styles.typeMatchupsStatusTitle}>
                                        {status} ({list.length})
                                    </div>
                                    <div className={styles.typeMatchupsStatusList}>
                                        {list.map((poke) => (
                                            <Card
                                                key={poke.id}
                                                className={styles.typeMatchupsTeamEntry}
                                                style={{ borderRadius: "0.5rem" }}
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
                                            </Card>
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


