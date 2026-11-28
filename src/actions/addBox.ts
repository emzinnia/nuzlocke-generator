import { Action } from "./action";

export type ADD_BOX = "ADD_BOX";
export const ADD_BOX: ADD_BOX = "ADD_BOX";

export interface AddBoxArgs {
    name: string;
    background: string;
    inheritFrom: "Team" | "Boxed" | "Dead" | "Champs";
}

export type addBox = ({
    name,
    background,
    inheritFrom,
}: AddBoxArgs) => Action<ADD_BOX>;
export function addBox({
    name,
    background,
    inheritFrom,
}: AddBoxArgs): Action<ADD_BOX> {
    return {
        type: ADD_BOX,
        name,
        background,
        inheritFrom,
    };
}

export type UPDATE_BOXES = "UPDATE_BOXES";
export const UPDATE_BOXES: UPDATE_BOXES = "UPDATE_BOXES";

export type updateBoxes = () => Action<UPDATE_BOXES>;
export function updateBoxes(): Action<UPDATE_BOXES> {
    return {
        type: UPDATE_BOXES,
    };
}
