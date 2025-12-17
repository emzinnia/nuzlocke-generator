import { combineReducers } from "redux";

import { nuzlockes } from "./nuzlocke";
import { pokemon } from "./pokemon";
import { box } from "./box";
import { confirmation } from "./confirmation";
import { selectedId } from "./selectedId";
import { game } from "./game";
import { trainer } from "./trainer";
import { history } from "./history";
import { style } from "./style";
import { sawRelease } from "./sawRelease";
import { editor } from "./editor";
import { rules } from "./rules";
import { checkpoints } from "./checkpoints";
import { customMoveMap } from "./customMoveMap";
import { stats } from "./stats";
import { customTypes } from "./customTypes";
import { editorHistory } from "./editorHistory";
import { excludedAreas, customAreas } from "./areas";
import { view } from "./view";
import { hotkeys } from "./hotkeys";

export const reducers = {
    box,
    checkpoints,
    confirmation,
    customAreas,
    customMoveMap,
    customTypes,
    editorHistory,
    excludedAreas,
    game,
    hotkeys,
    nuzlockes,
    pokemon,
    editor,
    selectedId,
    sawRelease,
    trainer,
    history,
    rules,
    stats,
    style,
    view,
};

export const appReducers = combineReducers(reducers);
