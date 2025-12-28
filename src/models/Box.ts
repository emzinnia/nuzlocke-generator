// Import directly to avoid circular dependency through utils barrel
import type { TeamImagesType } from "utils/styleDefaults";

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
