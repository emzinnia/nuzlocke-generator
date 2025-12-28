import { GenderElementProps } from "components/Common/Shared";
import { Badge } from "./Badge";
// Import directly to avoid circular dependency through utils barrel
import { Types } from "utils/Types";
import { Forme } from "utils/Forme";
// Use type-only import for Game since it's only used as a type
import type { Game } from "utils/data/listOfGames";

// Define Checkpoints locally to avoid circular dependency with reducers
type Checkpoints = Badge[];

export interface Pokemon {
    id: string;
    species: string;
    nickname?: string;
    status?: string;
    level?: number;
    gender?: GenderElementProps;
    met?: string;
    metLevel?: number;
    nature?: string;
    ability?: string;
    moves?: string[];
    causeOfDeath?: string;
    deathTimestamp?: string;
    forme?: Forme;
    item?: string;
    types?: [Types, Types];
    teraType?: Types;
    customImage?: string;
    customIcon?: string;
    customItemImage?: string;
    shiny?: boolean;
    badges?: string[];
    num?: string;
    position?: number;
    wonderTradedFor?: string;
    mvp?: boolean;
    gameOfOrigin?: Game;
    egg?: boolean;
    hidden?: boolean;
    extraData?: object;
    pokeball?: string;
    notes?: string;
    linkedTo?: Pokemon["id"] | null;
    checkpoints?: Checkpoints;
    gift?: boolean;
    /* @deprecated */
    champion?: boolean;
    alpha?: boolean;
}

// We export a non-type version when we need all the keys easily
export const PokemonKeys: Pokemon = {
    id: "",
    species: "",
    nickname: "",
    status: "",
    level: 0,
    gender: "f",
    met: "",
    metLevel: 0,
    nature: "",
    ability: "",
    moves: [],
    causeOfDeath: "",
    deathTimestamp: undefined,
    forme: "Normal" as Forme,
    item: "",
    types: [Types.Normal, Types.Normal],
    teraType: Types.Normal,
    customImage: "",
    customIcon: "",
    customItemImage: "",
    shiny: false,
    champion: false,
    badges: [],
    num: "",
    position: 0,
    wonderTradedFor: "",
    mvp: false,
    gameOfOrigin: "Red",
    egg: false,
    hidden: false,
    extraData: {},
    pokeball: "None",
    notes: "",
    checkpoints: [],
    gift: false,
    linkedTo: null,
    alpha: undefined,
};
