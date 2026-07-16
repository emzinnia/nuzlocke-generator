import { updateNuzlocke } from "actions";
import { State } from "state";
import { serializeNuzlockeSaveData } from "utils/nuzlockeJson";

export const syncCurrentNuzlocke = (
    state: State,
    updateCurrentNuzlocke: updateNuzlocke,
) => {
    const currentId = state.nuzlockes.currentId;
    if (!currentId) return;

    updateCurrentNuzlocke(currentId, serializeNuzlockeSaveData(state));
};
