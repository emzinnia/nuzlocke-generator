import { TeamImagesType } from "utils";

export interface Box {
    id: number;
    name: string;
    background?: string;
    inheritFrom?: string;
    collapsed?: boolean;
    imageTypes?: TeamImagesType;
    position?: number;
}

export type Boxes = Box[];
