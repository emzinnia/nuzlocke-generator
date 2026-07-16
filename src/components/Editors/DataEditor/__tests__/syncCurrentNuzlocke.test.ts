import { describe, expect, it, vi } from "vitest";
import { updateNuzlocke } from "actions";
import { createDefaultState } from "store";
import { syncCurrentNuzlocke } from "../syncCurrentNuzlocke";

describe("syncCurrentNuzlocke", () => {
    it("saves the latest live state before an import replaces it", () => {
        const state = {
            ...createDefaultState(),
            trainer: {
                badges: [],
                name: "Latest trainer name",
                title: "",
            },
            nuzlockes: {
                currentId: "save-a",
                saves: [
                    {
                        id: "save-a",
                        data: JSON.stringify({
                            trainer: { name: "Stale trainer name" },
                        }),
                    },
                ],
            },
        };
        const updateCurrentNuzlocke = vi.fn(
            (id: string, data: string) => updateNuzlocke(id, data),
        );

        syncCurrentNuzlocke(state, updateCurrentNuzlocke);

        expect(updateCurrentNuzlocke).toHaveBeenCalledOnce();
        const [id, serializedState] = updateCurrentNuzlocke.mock.calls[0];
        const savedState = JSON.parse(serializedState);
        expect(id).toBe("save-a");
        expect(savedState.trainer.name).toBe("Latest trainer name");
        expect(savedState.nuzlockes).toBeUndefined();
        expect(savedState.editorHistory).toBeUndefined();
        expect(savedState.style.editorDarkMode).toBeUndefined();
    });

    it("does not create an invalid save entry when there is no current save", () => {
        const state = {
            ...createDefaultState(),
            nuzlockes: {
                currentId: "",
                saves: [],
            },
        };
        const updateCurrentNuzlocke = vi.fn(
            (id: string, data: string) => updateNuzlocke(id, data),
        );

        syncCurrentNuzlocke(state, updateCurrentNuzlocke);

        expect(updateCurrentNuzlocke).not.toHaveBeenCalled();
    });
});
