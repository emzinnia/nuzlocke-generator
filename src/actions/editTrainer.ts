import { Trainer } from "models";
import { Action } from "./action";

export type EDIT_TRAINER = "EDIT_TRAINER";
export const EDIT_TRAINER: EDIT_TRAINER = "EDIT_TRAINER";

export function editTrainer(
    edits: Partial<Trainer>,
): Action<EDIT_TRAINER, Partial<Trainer>> {
    return {
        type: EDIT_TRAINER,
        edits,
    };
}
