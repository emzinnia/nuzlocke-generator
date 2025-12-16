import * as React from "react";
import { connect } from "react-redux";
import { Toaster, Intent } from "@blueprintjs/core";
import {
    selectPokemon,
    deletePokemon,
    addPokemon,
    newNuzlocke,
    changeEditorSize,
    toggleDialog,
    editPokemon,
} from "actions";
import { Pokemon, Boxes } from "models";
import { sortPokes, sortPokesReverse, noop, generateEmptyPokemon } from "utils";
import { listOfHotkeys, HotkeyList } from "utils";
import { persistor } from "store";
import { State } from "state";
import { createStore } from "redux";
import { appReducers } from "reducers";
import { Editor } from "models";
import { HotkeyBindings } from "reducers/hotkeys";

export interface HotkeysProps {
    selectPokemon: selectPokemon;
    deletePokemon: deletePokemon;
    addPokemon: addPokemon;
    newNuzlocke: newNuzlocke;
    changeEditorSize: changeEditorSize;
    toggleDialog: toggleDialog;
    editPokemon: typeof editPokemon;
    pokemon: Pokemon[];
    boxes: Boxes;
    selectedId: string;
    editor: Editor;
    customHotkeys: HotkeyBindings;
}

export class HotkeysBase extends React.PureComponent<HotkeysProps> {
    public globalHotkeysEvents: any;

    public constructor(props) {
        super(props);
        this.globalHotkeysEvents = {
            handleKeyDown: this.handleKeyDown,
            handleKeyUp: this.handleKeyUp,
        };
    }

    public componentDidMount() {
        document.addEventListener(
            "keydown",
            this.globalHotkeysEvents.handleKeyDown,
        );
        document.addEventListener(
            "keyup",
            this.globalHotkeysEvents.handleKeyUp,
        );
    }

    public UNSAFE_componentWillMount() {
        document.removeEventListener(
            "keydown",
            this.globalHotkeysEvents.handleKeyDown,
        );
        document.removeEventListener(
            "keyup",
            this.globalHotkeysEvents.handleKeyUp,
        );
    }

     
    private handleKeyDown = (event: KeyboardEvent) => {
        return;
    };

    private getEffectiveKey(hotkey: HotkeyList): string {
        // If there's a custom binding for this action, use it
        if (hotkey.onKeyUp && this.props.customHotkeys[hotkey.onKeyUp]) {
            return this.props.customHotkeys[hotkey.onKeyUp];
        }
        return hotkey.key;
    }

    private handleKeyUp = (e: KeyboardEvent) => {
        listOfHotkeys.map((hotkey) => {
            const effectiveKey = this.getEffectiveKey(hotkey);
            if (e.key === effectiveKey) {
                if (this.isTextInput(e)) {
                    noop();
                } else {
                    if (hotkey?.onKeyUp) this[hotkey.onKeyUp]();
                }
            }
        });
    };

    private isTextInput(e: KeyboardEvent) {
        const elem = e.target as HTMLElement;
        if (elem == null || elem.closest == null) {
            return false;
        }
        const editable = elem.closest(
            "input, textarea, [contenteditable=true], select",
        );

        if (editable == null) {
            return false;
        }

        if (editable.tagName.toLowerCase() === "input") {
            const inputType = (editable as HTMLInputElement).type;
            if (inputType === "checkbox" || inputType === "radio") {
                return false;
            }
        }

        if ((editable as HTMLInputElement).readOnly) {
            return false;
        }

        return true;
    }

    private getFirstPokemonId() {
        return this.props.pokemon.sort(sortPokes)[0].id;
    }

    private getLastPokemonId() {
        return this.props.pokemon.sort(sortPokesReverse)[0].id;
    }

    private manualSave() {
        persistor
            .flush()
            .then((res) => {
                const toaster = Toaster.create();
                toaster.show({
                    message: "Save successful!",
                    intent: Intent.SUCCESS,
                });
            })
            .catch((err) => {
                const toaster = Toaster.create();
                toaster.show({
                    message: "Saved failed. Please try again.",
                    intent: Intent.DANGER,
                });
            });
    }

    private previousPokemon() {
        if (!this.props?.pokemon?.length) return;
        const poke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        const position = poke!.position;
        const prevPoke = this.props.pokemon.find(
            (p) => p.position === position! - 1,
        );
        const id = prevPoke ? prevPoke.id : this.getLastPokemonId();
        this.props.selectPokemon(id);
    }

    private nextPokemon() {
        if (!this.props?.pokemon?.length) return;
        const poke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        const position = poke!.position;
        const nextPoke = this.props.pokemon.find(
            (p) => p.position === position! + 1,
        );
        const id = nextPoke ? nextPoke.id : this.getFirstPokemonId();
        this.props.selectPokemon(id);
    }

    private addPokemon() {
        this.props.addPokemon(generateEmptyPokemon(this.props.pokemon));
    }

    private deletePokemon() {
        if (!this.props.selectedId) return;
        this.props.deletePokemon(this.props.selectedId);
    }

    private newNuzlocke() {
        const data = createStore(appReducers)?.getState();
        this.props.newNuzlocke(JSON.stringify(data), { isCopy: false });
    }

    private toggleEditor() {
        console.log("pressed m");
        this.props.changeEditorSize(!this.props.editor.minimized);
    }

    private toggleImageUploader() {
        this.props.toggleDialog("imageUploader");
    }

    private movePokemonUp() {
        if (!this.props.selectedId || !this.props.pokemon?.length) return;
        
        const currentPoke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        if (!currentPoke) return;

        // Get Pokemon in the same status box, sorted by position
        const sameStatusPokemon = this.props.pokemon
            .filter((p) => p.status === currentPoke.status)
            .sort(sortPokes);

        const currentIndex = sameStatusPokemon.findIndex(
            (p) => p.id === currentPoke.id,
        );

        // Can't move up if already at the top
        if (currentIndex <= 0) return;

        const targetPoke = sameStatusPokemon[currentIndex - 1];
        
        // Swap positions
        this.props.editPokemon({ position: targetPoke.position }, currentPoke.id);
        this.props.editPokemon({ position: currentPoke.position }, targetPoke.id);
    }

    private movePokemonDown() {
        if (!this.props.selectedId || !this.props.pokemon?.length) return;
        
        const currentPoke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        if (!currentPoke) return;

        // Get Pokemon in the same status box, sorted by position
        const sameStatusPokemon = this.props.pokemon
            .filter((p) => p.status === currentPoke.status)
            .sort(sortPokes);

        const currentIndex = sameStatusPokemon.findIndex(
            (p) => p.id === currentPoke.id,
        );

        // Can't move down if already at the bottom
        if (currentIndex >= sameStatusPokemon.length - 1) return;

        const targetPoke = sameStatusPokemon[currentIndex + 1];
        
        // Swap positions
        this.props.editPokemon({ position: targetPoke.position }, currentPoke.id);
        this.props.editPokemon({ position: currentPoke.position }, targetPoke.id);
    }

    public render() {
        return <div />;
    }
}

export const Hotkeys = connect(
    (state: Pick<State, keyof State>) => ({
        pokemon: state.pokemon,
        selectedId: state.selectedId,
        editor: state.editor,
        customHotkeys: state.hotkeys,
    }),
    {
        selectPokemon,
        deletePokemon,
        addPokemon,
        newNuzlocke,
        changeEditorSize,
        toggleDialog,
        editPokemon,
    },
)(HotkeysBase);
