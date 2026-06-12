import { describe, expect, it, vi } from "vitest";
import { createDefaultState } from "store";
import { HotkeysBase, HotkeysProps } from "../Hotkeys";
import { State } from "state";
import { serializeNuzlockeSaveData } from "utils/nuzlockeJson";

type HotkeysBasePrivate = HotkeysBase & {
    newNuzlocke: () => void;
};

describe("HotkeysBase", () => {
    it("creates a new nuzlocke with the same state transition as the save menu", () => {
        const currentState: State = {
            ...createDefaultState(),
            game: {
                name: "Emerald",
                customName: "Unsaved current run",
            },
            style: {
                ...createDefaultState().style,
                editorDarkMode: true,
            },
        };
        const serializedState = serializeNuzlockeSaveData(currentState);
        const updateNuzlocke = vi.fn();
        const newNuzlocke = vi.fn();
        const replaceState = vi.fn();
        const props = {
            selectPokemon: vi.fn(),
            deletePokemon: vi.fn(),
            addPokemon: vi.fn(),
            newNuzlocke,
            updateNuzlocke,
            replaceState,
            changeEditorSize: vi.fn(),
            toggleDialog: vi.fn(),
            editPokemon: vi.fn(),
            pokemon: [],
            boxes: [],
            selectedId: "",
            editor: { minimized: false },
            style: currentState.style,
            customHotkeys: {},
            editStyle: vi.fn(),
            currentNuzlockeId: "current-save",
            serializedState,
        } as unknown as HotkeysProps;

        (new HotkeysBase(props) as unknown as HotkeysBasePrivate).newNuzlocke();

        expect(updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            serializedState,
        );
        expect(newNuzlocke).toHaveBeenCalledWith(expect.any(String), {
            isCopy: false,
        });
        const createdSave = JSON.parse(newNuzlocke.mock.calls[0][0]);
        expect(createdSave.nuzlockes).toBeUndefined();
        expect(createdSave.editorHistory).toBeUndefined();
        expect(createdSave.style).not.toHaveProperty("editorDarkMode");
        expect(replaceState).toHaveBeenCalledWith(expect.objectContaining({}));
        expect(replaceState.mock.calls[0][0].nuzlockes).toEqual(
            createDefaultState().nuzlockes,
        );
    });
});
