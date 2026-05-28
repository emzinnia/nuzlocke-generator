import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { replaceState, newNuzlocke } from "actions";
import { createDefaultState } from "store";
import { State } from "state";
import { serializeNuzlockeJson } from "utils/nuzlockeJson";
import { DataEditorBase } from "../DataEditor";

type DataEditorHarness = {
    state: DataEditorBase["state"];
    exportState: (state: State) => void;
    closeDataDialog: () => void;
};

const createEditor = () => {
    const state = createDefaultState();
    const editor = new DataEditorBase({
        state,
        replaceState: vi.fn() as unknown as replaceState,
        newNuzlocke: vi.fn() as unknown as newNuzlocke,
    });

    editor.setState = ((nextState: Partial<typeof editor.state>) => {
        Object.assign(editor.state, nextState);
    }) as DataEditorBase["setState"];

    return { editor: editor as unknown as DataEditorHarness, state };
};

describe("DataEditor export", () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        createObjectURL = vi
            .fn()
            .mockReturnValueOnce("blob:nuzlocke-export-1")
            .mockReturnValueOnce("blob:nuzlocke-export-2");
        revokeObjectURL = vi.fn();

        vi.stubGlobal("URL", {
            ...URL,
            createObjectURL,
            revokeObjectURL,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("exports nuzlocke JSON through a blob URL instead of a data URL", async () => {
        const { editor, state } = createEditor();

        editor.exportState(state);

        expect(createObjectURL).toHaveBeenCalledOnce();
        const blob = createObjectURL.mock.calls[0][0] as Blob;
        expect(blob.type).toBe("application/json");
        expect(await blob.text()).toBe(serializeNuzlockeJson(state));
        expect(editor.state.href).toBe("blob:nuzlocke-export-1");
        expect(editor.state.href.startsWith("data:")).toBe(false);
    });

    it("revokes export blob URLs after replacement and close", () => {
        const { editor, state } = createEditor();

        editor.exportState(state);
        editor.exportState(state);
        editor.closeDataDialog();

        expect(revokeObjectURL).toHaveBeenNthCalledWith(
            1,
            "blob:nuzlocke-export-1",
        );
        expect(revokeObjectURL).toHaveBeenNthCalledWith(
            2,
            "blob:nuzlocke-export-2",
        );
        expect(editor.state.href).toBe("");
        expect(editor.state.isOpen).toBe(false);
    });
});
