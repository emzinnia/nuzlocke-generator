import { describe, expect, it, vi } from "vitest";
import { HotkeysBase, HotkeysProps } from "../Hotkeys";

describe("HotkeysBase", () => {
    const createProps = () => {
        const updateNuzlocke = vi.fn();
        const newNuzlocke = vi.fn();
        const replaceState = vi.fn();
        const serializedCurrentState = "{\"trainer\":{\"name\":\"Current\"}}";
        const props = {
            addPokemon: vi.fn(),
            boxes: [],
            changeEditorSize: vi.fn(),
            currentId: "current-save",
            customHotkeys: {},
            deletePokemon: vi.fn(),
            editPokemon: vi.fn(),
            editStyle: vi.fn(),
            editor: { minimized: false },
            newNuzlocke,
            pokemon: [],
            replaceState,
            selectPokemon: vi.fn(),
            selectedId: "",
            state: serializedCurrentState,
            style: {},
            toggleDialog: vi.fn(),
            updateNuzlocke,
        } as unknown as HotkeysProps;

        return {
            newNuzlocke,
            props,
            replaceState,
            serializedCurrentState,
            updateNuzlocke,
        };
    };

    it("saves the current run before creating a new nuzlocke from the hotkey", () => {
        const {
            newNuzlocke,
            props,
            replaceState,
            serializedCurrentState,
            updateNuzlocke,
        } = createProps();
        const instance = new HotkeysBase(props);

        (instance as unknown as { newNuzlocke: () => void }).newNuzlocke();

        expect(updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            serializedCurrentState,
        );
        expect(newNuzlocke).toHaveBeenCalledWith(expect.any(String), {
            isCopy: false,
        });
        expect(replaceState).toHaveBeenCalledTimes(1);

        const storedNewRun = JSON.parse(newNuzlocke.mock.calls[0][0]);
        const liveNewRun = replaceState.mock.calls[0][0];
        expect(storedNewRun.nuzlockes).toBeUndefined();
        expect(storedNewRun.editorHistory).toBeUndefined();
        expect(storedNewRun.style.editorDarkMode).toBeUndefined();
        expect(storedNewRun.game).toEqual(liveNewRun.game);
        expect(storedNewRun.trainer).toEqual(liveNewRun.trainer);
    });

    it("treats shift+n as the new-nuzlocke hotkey, not add-pokemon", () => {
        const { newNuzlocke, props } = createProps();
        const instance = new HotkeysBase(props);

        (
            instance as unknown as { rebuildHotkeyMaps: () => void }
        ).rebuildHotkeyMaps();
        (
            instance as unknown as {
                handleKeyUp: (event: Partial<KeyboardEvent>) => void;
            }
        ).handleKeyUp({
            key: "n",
            shiftKey: true,
            target: document.body,
        });

        expect(props.addPokemon).not.toHaveBeenCalled();
        expect(newNuzlocke).toHaveBeenCalledTimes(1);
    });

    it("keeps shift+n when shift is released before n", () => {
        const { newNuzlocke, props } = createProps();
        const instance = new HotkeysBase(props);

        (
            instance as unknown as { rebuildHotkeyMaps: () => void }
        ).rebuildHotkeyMaps();
        const hotkeys = instance as unknown as {
            handleKeyDown: (event: Partial<KeyboardEvent>) => void;
            handleKeyUp: (event: Partial<KeyboardEvent>) => void;
        };

        hotkeys.handleKeyDown({
            code: "ShiftLeft",
            key: "Shift",
            shiftKey: true,
            target: document.body,
        });
        hotkeys.handleKeyDown({
            code: "KeyN",
            key: "n",
            shiftKey: true,
            target: document.body,
        });
        hotkeys.handleKeyUp({
            code: "ShiftLeft",
            key: "Shift",
            shiftKey: false,
            target: document.body,
        });
        hotkeys.handleKeyUp({
            code: "KeyN",
            key: "n",
            shiftKey: false,
            target: document.body,
        });

        expect(props.addPokemon).not.toHaveBeenCalled();
        expect(newNuzlocke).toHaveBeenCalledTimes(1);
    });
});
