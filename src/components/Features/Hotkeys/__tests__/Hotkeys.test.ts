import { describe, expect, it, vi } from "vitest";
import { HotkeysBase, HotkeysProps } from "../Hotkeys";
import { createDefaultState } from "store";
import { serializeNuzlockeSaveData } from "utils";

describe("Hotkeys", () => {
    it("creates a new Nuzlocke with the same save-and-replace flow as the save menu", () => {
        const defaultState = createDefaultState();
        const currentState = {
            ...defaultState,
            trainer: {
                ...defaultState.trainer,
                name: "Current Trainer",
            },
        };
        const updateNuzlocke = vi.fn();
        const newNuzlocke = vi.fn();
        const replaceState = vi.fn();
        const props = {
            selectPokemon: vi.fn(),
            deletePokemon: vi.fn(),
            addPokemon: vi.fn(),
            newNuzlocke,
            changeEditorSize: vi.fn(),
            toggleDialog: vi.fn(),
            editPokemon: vi.fn(),
            updateNuzlocke,
            replaceState,
            pokemon: currentState.pokemon,
            boxes: currentState.box,
            nuzlockes: {
                currentId: "current-save",
                saves: [],
            },
            state: serializeNuzlockeSaveData(currentState),
            selectedId: "",
            editor: currentState.editor,
            style: currentState.style,
            customHotkeys: currentState.hotkeys,
            editStyle: vi.fn(),
        } as unknown as HotkeysProps;
        const instance = new HotkeysBase(props);

        (instance as unknown as { newNuzlocke: () => void }).newNuzlocke();

        expect(updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            serializeNuzlockeSaveData(currentState),
        );
        expect(newNuzlocke).toHaveBeenCalledWith(expect.any(String), {
            isCopy: false,
        });
        expect(JSON.parse(newNuzlocke.mock.calls[0][0])).not.toHaveProperty(
            "nuzlockes",
        );
        const replacement = replaceState.mock.calls[0][0];
        expect(replacement.nuzlockes).toEqual(createDefaultState().nuzlockes);
        expect(replacement.trainer).toEqual(createDefaultState().trainer);
    });
});
