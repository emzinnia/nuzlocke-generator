import { Theme } from "./Theme";
import { Styles } from "utils";

export class HexagonsTheme implements Theme {
    public name = "Hexagons";
    public disablesStyles: Partial<keyof Styles>[] = ["movesPosition"];

    public createStyles(options) {
        return {
            ChampsPokemon: {},
        };
    }

    public onThemeInit() {}

    public onThemePreview() {}

    public themeOptions = [
        {
            name: "Move Transparency",
            type: "Number",
            options: {
                step: 0.1,
                min: 0,
                max: 0,
            },
        },
    ];
}
