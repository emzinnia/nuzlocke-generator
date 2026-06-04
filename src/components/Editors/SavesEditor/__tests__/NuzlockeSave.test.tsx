import { vi } from "vitest";
import { State } from "state";
import { createDefaultState } from "store";
import { NuzlockeSaveBase, NuzlockeSaveControlsProps } from "../NuzlockeSave";

type CopyableNuzlockeSave = {
    copyNuzlocke: (data: string, isCurrent: boolean) => void;
};

const createSerializedState = (customName: string) => {
    const state = createDefaultState();

    return JSON.stringify({
        ...state,
        game: {
            ...state.game,
            customName,
        },
    });
};

const createProps = (
    state: string,
): NuzlockeSaveControlsProps => ({
    nuzlockes: {
        currentId: "current-save",
        saves: [
            {
                id: "current-save",
                data: createSerializedState("stale-current"),
            },
            {
                id: "other-save",
                data: createSerializedState("other-save"),
            },
        ],
    },
    state,
    darkMode: false,
    updateNuzlocke: vi.fn(),
    deleteNuzlocke: vi.fn(),
    newNuzlocke: vi.fn(),
    switchNuzlocke: vi.fn(),
    replaceState: vi.fn(),
    updateSwitchNuzlocke: vi.fn(),
});

const createComponent = (props: NuzlockeSaveControlsProps) =>
    new NuzlockeSaveBase(props) as unknown as CopyableNuzlockeSave;

describe("<NuzlockeSave />", () => {
    it("copies the live state when copying the current nuzlocke", () => {
        const liveState = createSerializedState("live-current");
        const props = createProps(liveState);
        const component = createComponent(props);

        component.copyNuzlocke(props.nuzlockes.saves[0].data, true);

        expect(props.updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            liveState,
        );
        expect(props.newNuzlocke).toHaveBeenCalledWith(liveState, {
            isCopy: true,
        });
        expect(props.replaceState).toHaveBeenCalledWith(
            JSON.parse(liveState) as State,
        );
    });

    it("saves the current nuzlocke before loading a copied saved nuzlocke", () => {
        const liveState = createSerializedState("live-current");
        const otherState = createSerializedState("other-save");
        const props = createProps(liveState);
        const component = createComponent(props);

        component.copyNuzlocke(otherState, false);

        expect(props.updateNuzlocke).toHaveBeenCalledWith(
            "current-save",
            liveState,
        );
        expect(props.newNuzlocke).toHaveBeenCalledWith(otherState, {
            isCopy: true,
        });
        expect(props.replaceState).toHaveBeenCalledWith(
            JSON.parse(otherState) as State,
        );
    });
});
