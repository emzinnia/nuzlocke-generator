import { Button, Classes, Intent, Spinner } from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { Pokemon, Box as BoxModel, Boxes, Game } from "models";
import { State } from "state";
import { generateEmptyPokemon } from "utils";
import { CurrentPokemonEdit } from ".";
import { AddPokemonButton } from "components";
import { BaseEditor } from "components";
import { Box, BoxForm } from "components";
import { ErrorBoundary } from "components";
import { cx } from "emotion";
import { addPokemon, toggleDialog } from "actions";

export interface PokemonEditorProps {
    team: Pokemon[];
    boxes: Boxes;
    game: Game;
    style: State["style"];
    excludedAreas: State["excludedAreas"];
    customAreas: State["customAreas"];
    toggleDialog: toggleDialog;

    // @NOTE: uncomment this if you need to auto-generate Pokemon
    // will create failing tests as a warning to not push this :]
    // addPokemon: addPokemon;
}

export interface PokemonEditorState {
    isMassEditorOpen: boolean;
    searchTerm: string;
}

export interface BoxesComponentProps {
    boxes: Boxes;
    team: Pokemon[];
    searchTerm: string;
}

export class BoxesComponent extends React.Component<BoxesComponentProps> {
    private renderBoxes(boxes, team) {
        return boxes
            .sort((a: BoxModel, b: BoxModel) => {
                const positionA = a.position || 0;
                const positionB = b.position || 1;
                return positionA - positionB;
            })
            .map((box) => {
                return (
                    <Box
                        searchTerm={this.props.searchTerm || ""}
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
            isMassEditorOpen: false,
            searchTerm: "",
        };
    }

    private openMassEditor = (_e) => {
        this.setState({
            isMassEditorOpen: true,
        });
    };

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
                                gap: "0.35rem",
                            }}
                        >
                            <AddPokemonButton
                                pokemon={{
                                    ...generateEmptyPokemon(team),
                                    gameOfOrigin: this.props.game.name || "None",
                                }}
                            />
                            <Button
                                icon="layout-group-by"
                                className={Classes.MINIMAL}
                                intent={Intent.PRIMARY}
                                onClick={() => this.props.toggleDialog("typeMatchups")}
                            >
                                Type Matchups
                            </Button>
                        </div>
                        <div style={{ marginLeft: "auto", width: "50%" }}>
                            <Button
                                icon={"heat-grid"}
                                intent={Intent.PRIMARY}
                                onClick={this.openMassEditor}
                                className={cx(Classes.MINIMAL, Classes.FILL)}
                            >
                                Open Mass Editor
                            </Button>
                            <input
                                type="search"
                                placeholder="Search..."
                                className={Classes.INPUT}
                                value={this.state.searchTerm}
                                onChange={(e) =>
                                    this.setState({
                                        searchTerm: e.target.value,
                                    })
                                }
                                style={{ margin: "0.25rem", width: "100%" }}
                            />
                        </div>
                    </div>
                    <BoxesComponent
                        searchTerm={this.state.searchTerm}
                        boxes={boxes}
                        team={team}
                    />
                    <BoxForm boxes={boxes} />
                    <CurrentPokemonEdit />
                    <BaseEditor name="Location Checklist" defaultOpen={false}>
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
                    {this.state.isMassEditorOpen && (
                        <ErrorBoundary>
                            <MassEditor
                                isOpen={this.state.isMassEditorOpen}
                                toggleDialog={() =>
                                    this.setState({
                                        isMassEditorOpen:
                                            !this.state.isMassEditorOpen,
                                    })
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
    }),
    {
        addPokemon: addPokemon,
        toggleDialog,
    },
    null,
    { pure: true },
)(PokemonEditorBase as any);
