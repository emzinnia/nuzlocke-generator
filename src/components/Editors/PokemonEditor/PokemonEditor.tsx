import { Button, Intent, Spinner } from "components/ui/shims";
import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pokemon, Box as BoxModel, Boxes, DialogViewType } from "models";
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
import { toggleDialog } from "actions";

interface BoxesComponentProps {
    boxes: Boxes;
    team: Pokemon[];
    searchTerm: string;
    matchedIds: Set<string>;
    hasSearchQuery: boolean;
}

const BoxesComponent: React.FC<BoxesComponentProps> = ({
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
        <div className="flex flex-col gap-1">
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
        </div>
    );
};

const MassEditor = React.lazy(
    () => import("components/Editors/PokemonEditor/MassEditor"),
);
const PokemonLocationChecklist = React.lazy(
    () => import("components/Editors/PokemonEditor/PokemonLocationChecklist"),
);

export function PokemonEditor() {
    const dispatch = useDispatch();
    
    const team = useSelector((state: State) => state.pokemon);
    const boxes = useSelector((state: State) => state.box);
    const game = useSelector((state: State) => state.game);
    const style = useSelector((state: State) => state.style);
    const excludedAreas = useSelector((state: State) => state.excludedAreas);
    const customAreas = useSelector((state: State) => state.customAreas);
    const isMassEditorOpen = useSelector((state: State) => !!state.view?.dialogs?.massEditor);
    const [searchTerm, setSearchTerm] = useState(() => getPersistedSearchTerm());
    const [isBoxFormOpen, setIsBoxFormOpen] = useState(false);

    const openMassEditor = useCallback(() => {
        dispatch(toggleDialog("massEditor"));
    }, [dispatch]);

    const toggleBoxForm = useCallback(() => {
        setIsBoxFormOpen((prev) => !prev);
    }, []);

    const handleToggleDialog = useCallback((dialog: DialogViewType) => {
        dispatch(toggleDialog(dialog));
    }, [dispatch]);

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
                    className="flex flex-col gap-3 rounded-lg bg-bg-secondary/50 p-3 border border-border-muted"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <AddPokemonButton
                            pokemon={{
                                ...generateEmptyPokemon(team),
                                gameOfOrigin: game.name || "None",
                            }}
                        />
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <Button
                                icon="layout-group-by"
                                intent={Intent.PRIMARY}
                                onClick={() => handleToggleDialog("typeMatchups")}
                                hotkey={{ key: "t", showModifier: false }}
                                minimal
                            >
                                <span className="hidden sm:inline">Type Matchups</span>
                                <span className="sm:hidden">Types</span>
                            </Button>
                            <Button
                                icon="heat-grid"
                                intent={Intent.PRIMARY}
                                onClick={openMassEditor}
                                hotkey={{ key: "m", showModifier: false }}
                                minimal
                            >
                                <span className="hidden sm:inline">Mass Editor</span>
                                <span className="sm:hidden">Mass</span>
                            </Button>
                        </div>
                        <div className="h-6 w-px bg-border hidden sm:block" />
                        <Button
                            icon="plus"
                            intent={Intent.SUCCESS}
                            onClick={toggleBoxForm}
                            minimal
                            small
                        >
                            Add Status
                        </Button>
                        <PokemonSearchBar
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="ml-auto min-w-48 flex-1 max-w-xs"
                            style={{ paddingLeft: 0 }}
                        />
                    </div>
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
                <BoxForm boxes={boxes} isOpen={isBoxFormOpen} onToggle={toggleBoxForm} />
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
                            toggleDialog={() => handleToggleDialog("massEditor")}
                        />
                    </ErrorBoundary>
                )}
            </React.Suspense>
        </>
    );
}
