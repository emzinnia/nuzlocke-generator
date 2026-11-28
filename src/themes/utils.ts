import { CSSProperties } from "react";

export interface PropOptions {
    showNickname: boolean;
    showGender: boolean;
    showLevel: boolean;
}

export type Option = {
    styles?: CSSProperties;
    props?: Partial<PropOptions>;
};

export type OptionItems = "ChampsPokemon";

export type Options = { [O in OptionItems]?: Option };

// export const Options: Options = {
//     ChampsPokemon: {
//         styles: null,
//         props: {
//             showNickname: true,
//             showGender: false,
//             showLevel: false,
//         }
//     },
// };
