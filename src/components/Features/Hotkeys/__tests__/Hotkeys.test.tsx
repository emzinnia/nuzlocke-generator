import { describe, expect, it, vi } from "vitest";
import { createDefaultState } from "store";
import { stripEditorDarkModeFromState } from "utils";
import { HotkeysBase, HotkeysProps } from "../Hotkeys";

describe("Hotkeys", () => {
    it("creates a new nuzlocke without losing the active save state", () => {
        const defaultState = createDefaultState();
        const currentState = {
            ...defaultState,
            style: {
                ...defaultState.style,
                editorDarkMode: true,
            },
            nuzlockes: {
                currentId: "current-save",
                saves: [],
            },
        };
        const serializedCurrentState = JSON.stringify(
            stripEditorDarkModeFromState(currentState),
        );
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
            editStyle: vi.fn(),
            pokemon: defaultState.pokemon,
            boxes: defaultState.box,
            selectedId: defaultState.selectedId,
            editor: defaultState.editor,
            style: currentState.style,
            currentId: "current-save",
            state: serializedCurrentState,
            customHotkeys: defaultState.hotkeys,
        } as unknown as HotkeysProps;

        const hotkeys = new HotkeysBase(props);
        (
            hotkeys as unknown as {
                newNuzlocke: () => void;
            }
        ).newNuzlocke();

        expect(updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            serializedCurrentState,
        );
        expect(newNuzlocke).toHaveBeenCalledWith(expect.any(String), {
            isCopy: false,
        });
        expect(replaceState).toHaveBeenCalledTimes(1);

        const newSavePayload = JSON.parse(newNuzlocke.mock.calls[0][0]);
        expect(newSavePayload.nuzlockes).toBeUndefined();
        expect(newSavePayload.editorHistory).toBeUndefined();
        expect(newSavePayload.style.editorDarkMode).toBeUndefined();
        expect(updateNuzlocke.mock.invocationCallOrder[0]).toBeLessThan(
            newNuzlocke.mock.invocationCallOrder[0],
        );
        expect(newNuzlocke.mock.invocationCallOrder[0]).toBeLessThan(
            replaceState.mock.invocationCallOrder[0],
        );
    });
});
