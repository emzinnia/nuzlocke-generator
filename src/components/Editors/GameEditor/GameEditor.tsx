import * as React from "react";
import { connect } from "react-redux";
import {
    editGame,
    editStyle,
    resetCheckpoints,
} from "actions";
import { gameOfOriginToColor, listOfGames, Game } from "utils";

import { Button, Intent, Classes, HTMLSelect } from "components/ui/shims";
import { RulesEditorDialog } from "components/Editors/RulesEditor/RulesEditor";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

export interface GameEditorProps {
    game: any;
    editGame: any;
    style: State["style"];
    editStyle: editStyle;
    resetCheckpoints: resetCheckpoints;
}

const gameSubEditorStyle: any = {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: ".25rem",
};

const controlWidth = "170px";

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
        // Awful hack to get rid of `isOpen` conflict warning
        const RED: any = RulesEditorDialog;
        return (
            <>
                <RED isOpen={this.state.isOpen} onClose={this.toggleDialog} />
                <BaseEditor icon="ninja" name="Game">
                    <div style={gameSubEditorStyle}>
                        <div>
                            <label
                                className={Classes.INLINE}
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
                                style={{ width: controlWidth }}
                            >
                                {listOfGames.map((game) => (
                                    <option key={game}>{game}</option>
                                ))}
                            </HTMLSelect>
                        </div>
                        <Button
                            onClick={this.toggleDialog}
                            icon="list"
                            intent={Intent.PRIMARY}
                        >
                            Modify Rules
                        </Button>
                    </div>
                    <div style={gameSubEditorStyle}>
                        <div style={{ fontSize: "80%" }}>
                            <label
                                className={Classes.INLINE}
                                style={{ marginRight: "calc(.75rem + 2px)" }}
                            >
                                Name
                            </label>
                            <input
                                onChange={this.onInputName}
                                value={game.customName}
                                autoComplete={"false"}
                                size={20}
                                style={{ width: controlWidth }}
                                className={Classes.INPUT}
                                type="text"
                                placeholder={game.name}
                            />
                        </div>
                    </div>
                </BaseEditor>
            </>
        );
    }
}

export const GameEditor = connect(
    (state: Pick<State, keyof State>) => ({
        game: state.game,
        style: state.style,
    }),
    {
        editGame,
        editStyle,
        resetCheckpoints,
    },
)(GameEditorBase as any);
