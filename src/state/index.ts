import { Styles } from "utils";
import { Pokemon, Trainer, Game, Editor, Boxes, View } from "models";
import { Checkpoints } from "reducers/checkpoints";
import { Nuzlockes } from "reducers/nuzlocke";
import { History } from "reducers/editorHistory";
import { HotkeyBindings } from "reducers/hotkeys";
import { SaveUploadSettingsState } from "reducers/saveUploadSettings";

export interface State {
    box: Boxes;
    confirmation: boolean;
    checkpoints: Checkpoints;
    customAreas: string[];
    editor: Editor;
    excludedAreas: string[];
    game: Game;
    hotkeys: HotkeyBindings;
    pokemon: Pokemon[];
    rules: string[];
    sawRelease: { [v: string]: boolean };
    saveUploadSettings: SaveUploadSettingsState;
    selectedId: string;
    style: Styles;
    theme: any;
    trainer: Trainer;
    customMoveMap: { move: string; type: string; id: string }[];
    customTypes: { type: string; color: string; id: string }[];
    stats: Record<"id" | "value" | "key", string | undefined>[];
    nuzlockes: Nuzlockes;
    editorHistory: History<any>;
    view: View;
}
