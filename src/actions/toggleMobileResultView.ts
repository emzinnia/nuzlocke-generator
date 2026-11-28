import { Action } from "actions";

export type TOGGLE_MOBILE_RESULT_VIEW = "TOGGLE_MOBILE_RESULT_VIEW";
export const TOGGLE_MOBILE_RESULT_VIEW: TOGGLE_MOBILE_RESULT_VIEW =
    "TOGGLE_MOBILE_RESULT_VIEW";

export type toggleMobileResultView = () => Action<TOGGLE_MOBILE_RESULT_VIEW>;
export const toggleMobileResultView = (): Action<TOGGLE_MOBILE_RESULT_VIEW> => {
    return {
        type: TOGGLE_MOBILE_RESULT_VIEW,
    };
};
