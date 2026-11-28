import { Action } from "./action";

export type TOGGLE_TEMTEM_MODE = "TOGGLE_TEMTEM_MODE";
export const TOGGLE_TEMTEM_MODE: TOGGLE_TEMTEM_MODE = "TOGGLE_TEMTEM_MODE";

export type toggleTemtemMode = () => Action<TOGGLE_TEMTEM_MODE, boolean>;
export const toggleTemtemMode = (): Action<TOGGLE_TEMTEM_MODE, boolean> => {
    return {
        type: TOGGLE_TEMTEM_MODE,
    };
};
