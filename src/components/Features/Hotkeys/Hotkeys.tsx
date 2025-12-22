/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { connect } from "react-redux";
import {
    selectPokemon,
    deletePokemon,
    addPokemon,
    newNuzlocke,
    changeEditorSize,
    toggleDialog,
    editPokemon,
    editStyle,
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
import { Intent } from "components/ui/shims";
import { showToast } from "components/Common/Shared/appToaster";

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
    style: State["style"];
    customHotkeys: HotkeyBindings;
    editStyle: editStyle;
}

export class HotkeysBase extends React.PureComponent<HotkeysProps> {
    public globalHotkeysEvents: any;
    private keyUpActions: Map<string, Array<() => void>> = new Map();
    private firstPokemonId: string | null = null;
    private lastPokemonId: string | null = null;

    public constructor(props) {
        super(props);
        this.globalHotkeysEvents = {
            handleKeyDown: this.handleKeyDown,
            handleKeyUp: this.handleKeyUp,
        };
    }

    public componentDidMount() {
        this.rebuildHotkeyMaps();
        this.recomputeFirstLastPokemonIds();
        document.addEventListener(
            "keydown",
            this.globalHotkeysEvents.handleKeyDown,
        );
        document.addEventListener(
            "keyup",
            this.globalHotkeysEvents.handleKeyUp,
        );
    }

    public componentDidUpdate(prevProps: HotkeysProps) {
        if (prevProps.customHotkeys !== this.props.customHotkeys) {
            this.rebuildHotkeyMaps();
        }
        if (prevProps.pokemon !== this.props.pokemon) {
            this.recomputeFirstLastPokemonIds();
        }
    }

    public componentWillUnmount() {
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
        if (this.isTextInput(e)) return;
        const actions = this.keyUpActions.get(e.key);
        if (!actions?.length) return;
        actions.forEach((fn) => fn());
    };

    private rebuildHotkeyMaps() {
        const next = new Map<string, Array<() => void>>();

        for (const hotkey of listOfHotkeys) {
            if (!hotkey?.onKeyUp) continue;
            const effectiveKey = this.getEffectiveKey(hotkey);
            const candidate = (this as any)[hotkey.onKeyUp];
            if (typeof candidate !== "function") continue;

            const arr = next.get(effectiveKey) ?? [];
            // Bind once up front so keyup is O(1) dispatch.
            arr.push(candidate.bind(this));
            next.set(effectiveKey, arr);
        }

        this.keyUpActions = next;
    }

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

    private recomputeFirstLastPokemonIds() {
        const pokemon = this.props.pokemon;
        if (!pokemon?.length) {
            this.firstPokemonId = null;
            this.lastPokemonId = null;
            return;
        }

        // Avoid sorting (and avoid mutating props via Array.sort()).
        let minPos = Infinity;
        let maxPos = -Infinity;
        let minId: string | null = null;
        let maxId: string | null = null;

        for (const p of pokemon) {
            const pos = p.position;
            if (pos == null) continue;
            if (pos < minPos) {
                minPos = pos;
                minId = p.id;
            }
            if (pos > maxPos) {
                maxPos = pos;
                maxId = p.id;
            }
        }

        // Fallbacks if positions are missing.
        this.firstPokemonId = minId ?? pokemon[0].id ?? null;
        this.lastPokemonId = maxId ?? pokemon[pokemon.length - 1].id ?? null;
    }

    private getFirstPokemonId() {
        if (this.firstPokemonId) return this.firstPokemonId;
        this.recomputeFirstLastPokemonIds();
        return this.firstPokemonId ?? this.props.pokemon?.[0]?.id;
    }

    private getLastPokemonId() {
        if (this.lastPokemonId) return this.lastPokemonId;
        this.recomputeFirstLastPokemonIds();
        return this.lastPokemonId ?? this.props.pokemon?.[this.props.pokemon.length - 1]?.id;
    }

    private clickButtonByTestId(testId: string) {
        if (typeof document === "undefined") return;
        const button = document.querySelector<HTMLButtonElement>(
            `[data-testid="${testId}"]`,
        );
        if (!button || button.disabled) return;
        button.click();
    }

    private manualSave() {
        Promise.resolve(persistor.flush())
            .then(() => {
                showToast({
                    message: "Saved",
                    intent: Intent.SUCCESS,
                });
            })
            .catch((err) => {
                console.error("Manual save failed", err);
                showToast({
                    message: "Save failed",
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
        this.props.changeEditorSize(!this.props.editor.minimized);
    }

    private toggleImageUploader() {
        this.props.toggleDialog("imageUploader");
    }

    private toggleTypeMatchups() {
        this.props.toggleDialog("typeMatchups");
    }

    private toggleMassEditor() {
        this.props.toggleDialog("massEditor");
    }

    private importData() {
        this.clickButtonByTestId("import-data-button");
    }

    private exportData() {
        this.clickButtonByTestId("export-data-button");
    }

    private importSaveFile() {
        this.clickButtonByTestId("import-save-file-button");
    }

    private downloadImage() {
        this.clickButtonByTestId("download-image-button");
    }

    private toggleDarkMode() {
        const isDark = this.props.style?.editorDarkMode;
        if (typeof isDark === "boolean") {
            this.props.editStyle({ editorDarkMode: !isDark });
        }
    }

    private toggleReleaseDialog() {
        this.clickButtonByTestId("release-dialog-button");
    }

    private focusPokemonSearch() {
        const el = document.querySelector<HTMLInputElement>(
            '[data-testid="pokemon-search"]',
        );
        if (!el) return;
        el.focus();
        // Put caret at end for convenience
        const len = el.value?.length ?? 0;
        try {
            el.setSelectionRange(len, len);
        } catch {
            // ignore (some input types may not support selection)
        }
    }

    private toggleHistoryTimeline() {
        const btn = document.querySelector<HTMLButtonElement>(
            '[data-testid="history-timeline-button"]',
        );
        if (!btn || btn.disabled) return;
        btn.click();
    }

    private movePokemonLeft() {
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

        // Can't move left if already at the start
        if (currentIndex <= 0) return;

        const targetPoke = sameStatusPokemon[currentIndex - 1];
        
        // Swap positions
        this.props.editPokemon({ position: targetPoke.position }, currentPoke.id);
        this.props.editPokemon({ position: currentPoke.position }, targetPoke.id);
    }

    private movePokemonRight() {
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

        // Can't move right if already at the end
        if (currentIndex >= sameStatusPokemon.length - 1) return;

        const targetPoke = sameStatusPokemon[currentIndex + 1];
        
        // Swap positions
        this.props.editPokemon({ position: targetPoke.position }, currentPoke.id);
        this.props.editPokemon({ position: currentPoke.position }, targetPoke.id);
    }

    private getOrderedBoxNames(): string[] {
        // Get boxes sorted by position, return their names
        return [...this.props.boxes]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((box) => box.name);
    }

    private movePokemonStatusUp() {
        if (!this.props.selectedId || !this.props.pokemon?.length) return;
        
        const currentPoke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        if (!currentPoke) return;

        const orderedBoxNames = this.getOrderedBoxNames();
        const currentStatusIndex = orderedBoxNames.indexOf(currentPoke.status ?? "");
        
        if (currentStatusIndex < 0) return;

        // Cycle to the last status if at the first, otherwise go to previous
        const newIndex = currentStatusIndex === 0 
            ? orderedBoxNames.length - 1 
            : currentStatusIndex - 1;

        const newStatus = orderedBoxNames[newIndex];
        this.props.editPokemon({ status: newStatus }, currentPoke.id);
    }

    private movePokemonStatusDown() {
        if (!this.props.selectedId || !this.props.pokemon?.length) return;
        
        const currentPoke = this.props.pokemon.find(
            (p) => p.id === this.props.selectedId,
        );
        if (!currentPoke) return;

        const orderedBoxNames = this.getOrderedBoxNames();
        const currentStatusIndex = orderedBoxNames.indexOf(currentPoke.status ?? "");
        
        if (currentStatusIndex < 0) return;

        // Cycle to the first status if at the last, otherwise go to next
        const newIndex = currentStatusIndex === orderedBoxNames.length - 1 
            ? 0 
            : currentStatusIndex + 1;

        const newStatus = orderedBoxNames[newIndex];
        this.props.editPokemon({ status: newStatus }, currentPoke.id);
    }

    public render() {
        return <div />;
    }
}

export const Hotkeys = connect(
    (state: Pick<State, keyof State>) => ({
        pokemon: state.pokemon,
        boxes: state.box,
        selectedId: state.selectedId,
        editor: state.editor,
        style: state.style,
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
        editStyle,
    },
)(HotkeysBase);
