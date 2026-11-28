import { Styles } from "utils";
import { editStyle } from "actions";
import { CSSProperties } from "react";
import { Options } from "themes/utils";

export type Stylesheet = Options;

export interface NumberOption {
    step: number;
    min: number;
    max: number;
}

export interface ThemeOption {
    name: string;
    options: NumberOption;
}

export interface Theme {
    name: string;
    disablesStyles?: Partial<keyof Styles>[];

    createStyles(options: ThemeOption[]): Stylesheet;
    onThemeInit(editStyle?: editStyle): void;
    onThemePreview(): void;

    themeOptions?: ThemeOption[];
}
