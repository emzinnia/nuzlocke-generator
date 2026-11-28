import { BoxMappings } from "./boxMappings";

export interface ParserOptions {
    boxMappings: BoxMappings;
    selectedGame?: string;
    isCrystal?: boolean;
    type?: "nuzlocke" | "raw";
    debug?: boolean;
}
