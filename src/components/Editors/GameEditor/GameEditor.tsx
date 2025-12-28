import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    editGame,
    editStyle,
    resetCheckpoints,
} from "actions";
import { gameOfOriginToColor, listOfGames, Game } from "utils";

import { Select } from "components/ui/shims";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";
import { Input, Label } from "components/ui";

export function GameEditor() {
    const dispatch = useDispatch();
    const game = useSelector((state: State) => state.game);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(editGame({ name: e.target.value }));
        dispatch(editStyle({
            bgColor: gameOfOriginToColor(e.target.value as Game),
        }));
        dispatch(resetCheckpoints(e.target.value as Game));
    };

    const onInputName = (value: string) => {
        dispatch(editGame({ customName: value }));
    };

    return (
        <>
            <BaseEditor icon="ninja" name="Game">
                <div className="flex flex-row gap-2 pb-2">
                    <div className="flex flex-col">
                        <Label className="text-xs">
                            Version
                        </Label>
                        <Select
                            className="w-48"
                            value={game.name}
                            onChange={onChange}
                        >
                            {listOfGames.map((g) => (
                                <option key={g}>{g}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex flex-col">
                        <Label className="text-xs">
                            Name
                        </Label>
                        <Input
                            onChange={(e) => onInputName(e.target.value)}
                            value={game.customName}
                            autoComplete={"false"}
                            type="text"
                            placeholder={game.name}
                        />
                    </div>
                </div>
            </BaseEditor>
        </>
    );
}
