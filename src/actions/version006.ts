import { Action } from "./action";

export type VERSION_0_0_6_BETA = "VERSION_0_0_6_BETA";
export const VERSION_0_0_6_BETA: VERSION_0_0_6_BETA = "VERSION_0_0_6_BETA";

export function version0_0_6_BETA(): Action<VERSION_0_0_6_BETA> {
    return {
        type: VERSION_0_0_6_BETA,
    };
}

export type VERSION_1116 = "VERSION_1116";
export const VERSION_1116: VERSION_1116 = "VERSION_1116";

export function version1116(): Action<VERSION_1116> {
    return {
        type: VERSION_1116,
    };
}
