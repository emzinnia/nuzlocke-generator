import * as React from "react";
import { Dialog, Classes, Card, Button, Intent, Alert, Callout } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { PokemonIconPlain } from "components";
import { toggleDialog, editPokemon } from "actions";
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

    // Track pokemon IDs that have been swapped out of team (locally, not yet saved)
    const [removedFromTeam, setRemovedFromTeam] = React.useState<Set<string>>(new Set());
    // Track pokemon IDs that have been swapped into team (locally, not yet saved)
    const [addedToTeam, setAddedToTeam] = React.useState<Set<string>>(new Set());
    // Track if other pokemon list is scrolled to bottom
    const [otherScrolledToBottom, setOtherScrolledToBottom] = React.useState(false);
    const otherListRef = React.useRef<HTMLDivElement>(null);

    const handleOtherScroll = React.useCallback(() => {
        const el = otherListRef.current;
        if (!el) return;
        const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
        setOtherScrolledToBottom(isAtBottom);
    }, []);

    const onClose = React.useCallback(
        () => {
            dispatch(toggleDialog("typeMatchups"));
            // Reset local state on close
            setRemovedFromTeam(new Set());
            setAddedToTeam(new Set());
        },
        [dispatch],
    );

    const handleRemoveFromTeam = React.useCallback((id: string) => {
        setRemovedFromTeam((prev) => new Set(prev).add(id));
        setAddedToTeam((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const handleAddToTeam = React.useCallback((id: string) => {
        setAddedToTeam((prev) => new Set(prev).add(id));
        setRemovedFromTeam((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const handleConfirmTeam = React.useCallback(() => {
        // Update removed pokemon to "Boxed" status
        removedFromTeam.forEach((id) => {
            dispatch(editPokemon({ status: "Boxed" }, id));
        });
        // Update added pokemon to "Team" status
        addedToTeam.forEach((id) => {
            dispatch(editPokemon({ status: "Team" }, id));
        });
        // Reset local state
        setRemovedFromTeam(new Set());
        setAddedToTeam(new Set());
    }, [dispatch, removedFromTeam, addedToTeam]);

    const hasChanges = removedFromTeam.size > 0 || addedToTeam.size > 0;

    const others = React.useMemo(
        () =>
            pokemon
                ?.filter((p) => {
                    // Show pokemon that are NOT on team (and not added) OR removed from team
                    const isOnTeam = p?.status === "Team";
                    const isDead = p?.status === "Dead";
                    const wasRemoved = removedFromTeam.has(p.id);
                    const wasAdded = addedToTeam.has(p.id);
                    return (!isOnTeam && !isDead && !p?.hidden && !wasAdded) || wasRemoved;
                })
                .reduce<Record<string, typeof pokemon>>((acc, poke) => {
                    // If removed from team, show under "Swapped Out" group
                    const key = removedFromTeam.has(poke.id) ? "Swapped Out" : (poke.status || "Other");
                    acc[key] = acc[key] ? [...acc[key], poke] : [poke];
                    return acc;
                }, {}),
        [pokemon, removedFromTeam, addedToTeam],
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

    // Memoized displayed team (accounting for local swaps)
    const displayedTeam = React.useMemo(
        () =>
            pokemon
                ?.filter((p) => {
                    const isOnTeam = p?.status === "Team" && !p?.hidden;
                    const wasRemoved = removedFromTeam.has(p.id);
                    const wasAdded = addedToTeam.has(p.id);
                    return (isOnTeam && !wasRemoved) || wasAdded;
                })
                .sort(sortPokes) ?? [],
        [pokemon, removedFromTeam, addedToTeam],
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
                        <p>Click a Pokémon to swap it out.</p>
                        {displayedTeam.length > 6 && (
                            <Callout
                                intent={Intent.WARNING}
                                icon="warning-sign"
                            >
                                <p>
                                    Team has more than 6 Pokémon!
                                </p>
                            </Callout>
                        )}
                        
                        {displayedTeam.map((poke) => (
                                <Card
                                    key={poke.id}
                                    className={styles.typeMatchupsTeamEntryRemove}
                                    style={{ borderRadius: "0.5rem" }}
                                    onClick={() => handleRemoveFromTeam(poke.id)}
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
                        <Button
                            className={styles.confirmTeamButton}
                            intent={Intent.PRIMARY}
                            disabled={!hasChanges}
                            onClick={handleConfirmTeam}
                        >
                            Confirm As Team
                        </Button>
                    </div>
                    <div className={styles.typeMatchupsMain}>
                        <TypeMatchupSummary
                            pokemon={pokemon}
                            game={game}
                            customTypes={customTypes}
                            style={style}
                            removedFromTeam={removedFromTeam}
                            addedToTeam={addedToTeam}
                        />
                    </div>
                    <div
                        ref={otherListRef}
                        className={`${styles.typeMatchupsOther} ${otherScrolledToBottom ? styles.typeMatchupsOtherScrolledToBottom : ""}`}
                        style={{ color: textColor, minWidth: "12.5rem", maxWidth: "17.5rem" }}
                        onScroll={handleOtherScroll}
                    >
                        <h4>Other Pokémon</h4>
                        <p>Select a Pokémon to swap it into type matchups.</p>
                        {!sortedOthers.length ? (
                            <div>No other Pokémon</div>
                        ) : (
                            sortedOthers.map(([status, list]) => (
                                <div key={status} className={styles.typeMatchupsStatus}>
                                    {/* <div className={styles.typeMatchupsStatusTitle}>
                                        {status} ({list.length})
                                    </div> */}
                                    <div className={styles.typeMatchupsStatusList}>
                                        {list.map((poke) => (
                                            <Card
                                                key={poke.id}
                                                className={styles.typeMatchupsTeamEntry}
                                                style={{ borderRadius: "0.5rem" }}
                                                onClick={() => handleAddToTeam(poke.id)}
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


