import { Action } from "./action";

export type UPDATE_NICKNAME_PRESETS = "UPDATE_NICKNAME_PRESETS";
export const UPDATE_NICKNAME_PRESETS: UPDATE_NICKNAME_PRESETS =
    "UPDATE_NICKNAME_PRESETS";

export type updateNicknamePresets = (
    nicknamePresets: string[],
) => Action<UPDATE_NICKNAME_PRESETS>;

export function updateNicknamePresets(
    nicknamePresets: string[],
): Action<UPDATE_NICKNAME_PRESETS> {
    return {
        type: UPDATE_NICKNAME_PRESETS,
        nicknamePresets,
    };
}
