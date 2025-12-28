import React from "react";
import { connect } from "react-redux";
import {
    editGame,
    editStyle,
    resetCheckpoints,
} from "actions";
import { gameOfOriginToColor, listOfGames, Game } from "utils";
import { Game as GameModel } from "models";

import { Select } from "components/ui/shims";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { Input, Label } from "components/ui";

export interface GameEditorProps {
    game: GameModel;
    editGame: typeof editGame;
    style: State["style"];
    editStyle: editStyle;
    resetCheckpoints: resetCheckpoints;
}

const labelWidth = "50px";
const controlWidth = "170px";

export function GameEditorBase({
    game,
    editGame,
    editStyle,
    resetCheckpoints,
}: GameEditorProps) {
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        editGame({ name: e.target.value });
        editStyle({
            bgColor: gameOfOriginToColor(e.target.value as Game),
        });
        resetCheckpoints(e.target.value as Game);
    };

    const onInputName = (value: string) => {
        editGame({ customName: value });
    };

    return (
        <>
            <BaseEditor icon="ninja" name="Game">
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex items-center">
                        <Label className="text-xs" style={{ width: labelWidth }}>
                            Version
                        </Label>
                        <Select
                            value={game.name}
                            onChange={onChange}
                            style={{ width: controlWidth }}
                        >
                            {listOfGames.map((g) => (
                                <option key={g}>{g}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex items-center">
                        <Label className="text-xs" style={{ width: labelWidth }}>
                            Name
                        </Label>
                        <Input
                            onChange={(e) => onInputName(e.target.value)}
                            value={game.customName}
                            autoComplete={"false"}
                            style={{ width: controlWidth }}
                            type="text"
                            placeholder={game.name}
                        />
                    </div>
                </div>
            </BaseEditor>
        </>
    );
}

export const GameEditor = connect(
    (state: State) => ({
        game: state.game,
        style: state.style,
    }),
    {
        editGame,
        editStyle,
        resetCheckpoints,
    },
)(GameEditorBase);
