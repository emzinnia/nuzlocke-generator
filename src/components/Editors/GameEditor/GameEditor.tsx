import * as React from "react";
import { connect } from "react-redux";
import {
    editGame,
    changeEditorSize,
    editStyle,
    resetCheckpoints,
    toggleTemtemMode,
} from "actions";
import { gameOfOriginToColor, listOfGames, feature, Game } from "utils";

import { Button, Switch, HTMLSelect } from "components/Common/ui";
import { RulesEditorDialog } from "components/Editors/RulesEditor/RulesEditor";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

export interface GameEditorProps {
    game: any;
    editGame: any;
    editor: any;
    style: State["style"];
    editStyle: editStyle;
    changeEditorSize: changeEditorSize;
    resetCheckpoints: resetCheckpoints;
    toggleTemtemMode: toggleTemtemMode;
}

const gameSubEditorStyle: any = {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: ".25rem",
};

export class GameEditorBase extends React.Component<
    GameEditorProps,
    { isOpen: boolean }
> {
    public state = {
        isOpen: false,
    };

    private onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.editGame({ name: e.target.value });
        this.props.editStyle({
            bgColor: gameOfOriginToColor(e.target.value as Game),
        });
        this.props.resetCheckpoints(e.target.value as Game);
    };

    private onInputName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.editGame({ customName: e.target.value });
    };

    private toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });

    public render() {
        const { game } = this.props;
        const RED: any = RulesEditorDialog;
        return (
            <>
                <RED isOpen={this.state.isOpen} onClose={this.toggleDialog} />
                <BaseEditor icon="ninja" name="Game">
                    <div style={gameSubEditorStyle}>
                        <div>
                            <label
                                className="inline-flex items-center gap-2"
                                style={{
                                    fontSize: "80%",
                                    marginRight: ".5rem",
                                }}
                            >
                                Version
                            </label>
                            <HTMLSelect
                                value={game.name}
                                onChange={this.onChange}
                                options={listOfGames}
                            />
                        </div>
                        <Button
                            onClick={this.toggleDialog}
                            icon="list"
                            intent="primary"
                        >
                            Modify Rules
                        </Button>
                    </div>
                    <div style={gameSubEditorStyle}>
                        <div style={{ fontSize: "80%" }}>
                            <label
                                className="inline-flex items-center gap-2"
                                style={{ marginRight: "calc(.75rem + 2px)" }}
                            >
                                Name
                            </label>
                            <input
                                onChange={this.onInputName}
                                value={game.customName}
                                autoComplete={"false"}
                                size={20}
                                className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                type="text"
                                placeholder={game.name}
                            />
                        </div>
                        {feature.temTemMode && (
                            <Button
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                minimal
                            >
                                <Switch
                                    label="TemTem Mode"
                                    checked={this.props.editor.temtemMode}
                                    onChange={(checked) =>
                                        this.props.toggleTemtemMode()
                                    }
                                />
                            </Button>
                        )}
                    </div>
                </BaseEditor>
            </>
        );
    }
}

export const GameEditor = connect(
    (state: Pick<State, keyof State>) => ({
        game: state.game,
        editor: state.editor,
        style: state.style,
    }),
    {
        editGame,
        editStyle,
        changeEditorSize,
        resetCheckpoints,
        toggleTemtemMode,
    },
)(GameEditorBase as any);
