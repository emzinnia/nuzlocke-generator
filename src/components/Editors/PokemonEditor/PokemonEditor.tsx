import { Button, ButtonGroup, Classes, Intent, Spinner } from "components/ui/shims";
import * as React from "react";
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
import { HotkeyIndicator } from "components/Common/Shared";
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

export interface PokemonEditorState {
    searchTerm: string;
}

export interface BoxesComponentProps {
    boxes: Boxes;
    team: Pokemon[];
    searchTerm: string;
    matchedIds: Set<string>;
    hasSearchQuery: boolean;
}

export class BoxesComponent extends React.Component<BoxesComponentProps> {
    private renderBoxes(boxes: Boxes, team: Pokemon[]) {
        const { matchedIds, hasSearchQuery, searchTerm } = this.props;

        return boxes
            .sort((a: BoxModel, b: BoxModel) => {
                const positionA = a.position || 0;
                const positionB = b.position || 1;
                return positionA - positionB;
            })
            .map((box) => {
                return (
                    <Box
                        searchTerm={searchTerm || ""}
                        matchedIds={matchedIds}
                        hasSearchQuery={hasSearchQuery}
                        {...box}
                        key={box.id}
                        pokemon={team}
                    />
                );
            });
    }

    public render() {
        const { boxes, team } = this.props;

        return this.renderBoxes(boxes, team);
    }
}

const MassEditor = React.lazy(
    () => import("components/Editors/PokemonEditor/MassEditor"),
);
const PokemonLocationChecklist = React.lazy(
    () => import("components/Editors/PokemonEditor/PokemonLocationChecklist"),
);

export class PokemonEditorBase extends React.Component<
    PokemonEditorProps,
    PokemonEditorState
> {
    public constructor(props: PokemonEditorProps) {
        super(props);
        this.state = {
            searchTerm: getPersistedSearchTerm(),
        };
    }

    private openMassEditor = (_e) => {
        this.props.toggleDialog("massEditor");
    };

    private handleSearchChange = (value: string) => {
        this.setState({ searchTerm: value });
        setPersistedSearchTerm(value);
    };

    private renderBoxesWithSearch(boxes: Boxes, team: Pokemon[]) {
        const { searchTerm } = this.state;
        const hasSearchQuery = searchTerm.trim().length > 0;

        // Compute matched IDs using the search engine
        const searchResult = searchPokemon(team, searchTerm);

        return (
            <>
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
            </>
        );
    }

    public componentDidMount() {
        // @NOTE: refactor so that there's an easier way to auto-generate Pokemon data
        // const {team} = this.props;
        // listOfPokemon.slice(1008).forEach((value) => {
        //     this.props.addPokemon(
        //         generateEmptyPokemon(team, {
        //             species: value,
        //             // @ts-ignore cuzi said so
        //             types: matchSpeciesToTypes(value)
        //         }));
        // });
    }

    public render() {
        const { team, boxes, game, style, excludedAreas, customAreas } =
            this.props;

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
                                    gameOfOrigin: this.props.game.name || "None",
                                }}
                            />
                            <ButtonGroup className={Classes.MINIMAL}>
                                <Button
                                    icon="layout-group-by"
                                    intent={Intent.PRIMARY}
                                    onClick={() => this.props.toggleDialog("typeMatchups")}
                                >
                                    Type Matchups{" "}
                                    <HotkeyIndicator
                                        hotkey="t"
                                        showModifier={false}
                                        style={{ marginLeft: "0.35rem" }}
                                    />
                                </Button>
                                <Button
                                    icon={"heat-grid"}
                                    intent={Intent.PRIMARY}
                                    onClick={this.openMassEditor}
                                >
                                    Mass Editor{" "}
                                    <HotkeyIndicator
                                        hotkey="m"
                                        showModifier={false}
                                        style={{ marginLeft: "0.35rem" }}
                                    />
                                </Button>
                            </ButtonGroup>
                        </div>
                        <PokemonSearchBar
                            value={this.state.searchTerm}
                            onChange={this.handleSearchChange}
                        />
                    </div>
                    {this.renderBoxesWithSearch(boxes, team)}
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
                    {this.props.isMassEditorOpen && (
                        <ErrorBoundary>
                            <MassEditor
                                isOpen={this.props.isMassEditorOpen}
                                toggleDialog={() =>
                                    this.props.toggleDialog("massEditor")
                                }
                            />
                        </ErrorBoundary>
                    )}
                </React.Suspense>
            </>
        );
    }
}

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
