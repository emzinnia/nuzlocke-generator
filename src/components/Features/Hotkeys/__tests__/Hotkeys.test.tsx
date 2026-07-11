import { describe, expect, it, vi } from "vitest";
import { HotkeysBase, HotkeysProps } from "../Hotkeys";
import { createDefaultState } from "store";
import { generateEmptyPokemon } from "utils";

const createProps = (
    overrides: Partial<HotkeysProps> = {},
): HotkeysProps => {
    const currentState = {
        ...createDefaultState(),
        pokemon: [
            {
                ...generateEmptyPokemon(),
                id: "current-pokemon",
                species: "Pikachu",
            },
        ],
        nuzlockes: {
            currentId: "current-save",
            saves: [],
        },
    };

    return {
        selectPokemon: vi.fn() as unknown as HotkeysProps["selectPokemon"],
        deletePokemon: vi.fn() as unknown as HotkeysProps["deletePokemon"],
        addPokemon: vi.fn() as unknown as HotkeysProps["addPokemon"],
        newNuzlocke: vi.fn() as unknown as HotkeysProps["newNuzlocke"],
        updateNuzlocke: vi.fn() as unknown as HotkeysProps["updateNuzlocke"],
        replaceState: vi.fn() as unknown as HotkeysProps["replaceState"],
        changeEditorSize: vi.fn() as unknown as HotkeysProps["changeEditorSize"],
        toggleDialog: vi.fn() as unknown as HotkeysProps["toggleDialog"],
        editPokemon: vi.fn() as unknown as HotkeysProps["editPokemon"],
        editStyle: vi.fn() as unknown as HotkeysProps["editStyle"],
        pokemon: currentState.pokemon,
        boxes: currentState.box,
        selectedId: "",
        editor: currentState.editor,
        style: currentState.style,
        customHotkeys: {},
        currentState,
        nuzlockes: currentState.nuzlockes,
        ...overrides,
    };
};

describe("<Hotkeys />", () => {
    it("saves the current run and replaces live state when Shift+N creates a new nuzlocke", () => {
        const props = createProps();
        const hotkeys = new HotkeysBase(props);

        (hotkeys as unknown as { newNuzlocke: () => void }).newNuzlocke();

        expect(props.updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            expect.any(String),
        );
        expect(props.newNuzlocke).toHaveBeenCalledWith(expect.any(String), {
            isCopy: false,
        });
        expect(props.replaceState).toHaveBeenCalledWith(createDefaultState());

        const outgoingSave = JSON.parse(
            (props.updateNuzlocke as unknown as ReturnType<typeof vi.fn>).mock
                .calls[0][1],
        );
        const newSave = JSON.parse(
            (props.newNuzlocke as unknown as ReturnType<typeof vi.fn>).mock
                .calls[0][0],
        );

        expect(outgoingSave.pokemon[0].species).toBe("Pikachu");
        expect(outgoingSave.nuzlockes).toBeUndefined();
        expect(outgoingSave.editorHistory).toBeUndefined();
        expect(outgoingSave.style.editorDarkMode).toBeUndefined();
        expect(newSave.nuzlockes).toBeUndefined();
        expect(newSave.editorHistory).toBeUndefined();
        expect(newSave.style.editorDarkMode).toBeUndefined();
    });
});
