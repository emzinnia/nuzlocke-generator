import { Button, ButtonGroup, Classes, Intent, Spinner } from "components/ui/shims";
import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { connect } from "react-redux";
import { Pokemon, Box as BoxModel, Boxes, Game } from "models";
import { State } from "state";
import { generateEmptyPokemon } from "utils";
import { searchPokemon } from "utils/search";
import { getPersistedSearchTerm, setPersistedSearchTerm } from "utils/searchTermStorage";
import { CurrentPokemonEdit } from ".";
import { AddPokemonButton } from "components";
import { BaseEditor } from "components";
import { Box, BoxForm } from "components";
import { ErrorBoundary } from "components";
import { PokemonSearchBar, SearchFeedback } from "./PokemonSearchBar";
import { addPokemon, toggleDialog } from "actions";

export interface PokemonEditorProps {
    team: Pokemon[];
    boxes: Boxes;
    game: Game;
    style: State["style"];
    excludedAreas: State["excludedAreas"];
    customAreas: State["customAreas"];
    isMassEditorOpen: boolean;
    toggleDialog: toggleDialog;

    // @NOTE: uncomment this if you need to auto-generate Pokemon
    // will create failing tests as a warning to not push this :]
    // addPokemon: addPokemon;
}

export interface BoxesComponentProps {
    boxes: Boxes;
    team: Pokemon[];
    searchTerm: string;
    matchedIds: Set<string>;
    hasSearchQuery: boolean;
}

export const BoxesComponent: React.FC<BoxesComponentProps> = ({
    boxes,
    team,
    searchTerm,
    matchedIds,
    hasSearchQuery,
}) => {
    const sortedBoxes = useMemo(
        () =>
            [...boxes].sort((a: BoxModel, b: BoxModel) => {
                const positionA = a.position || 0;
                const positionB = b.position || 1;
                return positionA - positionB;
            }),
        [boxes],
    );

    return (
        <>
            {sortedBoxes.map((box) => (
                <Box
                    searchTerm={searchTerm || ""}
                    matchedIds={matchedIds}
                    hasSearchQuery={hasSearchQuery}
                    {...box}
                    key={box.id}
                    pokemon={team}
                />
            ))}
        </>
    );
};

const MassEditor = React.lazy(
    () => import("components/Editors/PokemonEditor/MassEditor"),
);
const PokemonLocationChecklist = React.lazy(
    () => import("components/Editors/PokemonEditor/PokemonLocationChecklist"),
);

export const PokemonEditorBase: React.FC<PokemonEditorProps> = ({
    team,
    boxes,
    game,
    style,
    excludedAreas,
    customAreas,
    isMassEditorOpen,
    toggleDialog,
}) => {
    const [searchTerm, setSearchTerm] = useState(() => getPersistedSearchTerm());

    const openMassEditor = useCallback(() => {
        toggleDialog("massEditor");
    }, [toggleDialog]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setPersistedSearchTerm(value);
    }, []);

    const hasSearchQuery = searchTerm.trim().length > 0;
    const searchResult = useMemo(
        () => searchPokemon(team, searchTerm),
        [team, searchTerm],
    );

    return (
        <>
            <BaseEditor icon="circle" name="Pokemon">
                <div
                    data-testid="pokemon-editor"
                    className="button-row"
                    style={{ display: "flex", alignItems: "flex-start" }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        <AddPokemonButton
                            pokemon={{
                                ...generateEmptyPokemon(team),
                                gameOfOrigin: game.name || "None",
                            }}
                        />
                        <ButtonGroup className={Classes.MINIMAL}>
                            <Button
                                icon="layout-group-by"
                                intent={Intent.PRIMARY}
                                onClick={() => toggleDialog("typeMatchups")}
                                hotkey={{ key: "t", showModifier: false }}
                            >
                                Type Matchups
                            </Button>
                            <Button
                                icon={"heat-grid"}
                                intent={Intent.PRIMARY}
                                onClick={openMassEditor}
                                hotkey={{ key: "m", showModifier: false }}
                            >
                                Mass Editor
                            </Button>
                        </ButtonGroup>
                    </div>
                    <PokemonSearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <SearchFeedback
                    searchResult={searchResult}
                    hasSearchQuery={hasSearchQuery}
                />
                <BoxesComponent
                    searchTerm={searchTerm}
                    matchedIds={searchResult.matchedIds}
                    hasSearchQuery={hasSearchQuery}
                    boxes={boxes}
                    team={team}
                />
                <BoxForm boxes={boxes} />
                <CurrentPokemonEdit />
                <BaseEditor name="Location Checklist" defaultOpen={true}>
                    <React.Suspense fallback={<Spinner />}>
                        <PokemonLocationChecklist
                            customAreas={customAreas}
                            excludedAreas={excludedAreas}
                            boxes={boxes}
                            style={style}
                            pokemon={team}
                            game={game}
                        />
                    </React.Suspense>
                </BaseEditor>
            </BaseEditor>
            <React.Suspense fallback={<Spinner />}>
                {isMassEditorOpen && (
                    <ErrorBoundary>
                        <MassEditor
                            isOpen={isMassEditorOpen}
                            toggleDialog={() => toggleDialog("massEditor")}
                        />
                    </ErrorBoundary>
                )}
            </React.Suspense>
        </>
    );
};

export const PokemonEditor = connect(
    (state: Pick<State, keyof State>) => ({
        team: state.pokemon,
        boxes: state.box,
        game: state.game,
        style: state.style,
        excludedAreas: state.excludedAreas,
        customAreas: state.customAreas,
        isMassEditorOpen: !!state.view?.dialogs?.massEditor,
    }),
    {
        addPokemon: addPokemon,
        toggleDialog,
    },
    null,
    { pure: true },
)(PokemonEditorBase);
