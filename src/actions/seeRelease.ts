import { Action } from "./action";

export type SEE_RELEASE = "SEE_RELEASE";
export const SEE_RELEASE: SEE_RELEASE = "SEE_RELEASE";

export type seeRelease = (release?: string) => Action<SEE_RELEASE>;
export const seeRelease = (release?: string): Action<SEE_RELEASE> => {
    return {
        type: SEE_RELEASE,
        release,
    };
};
