import { Styles } from "utils";
import { Theme } from "./Theme";

export class DefaultDarkTheme implements Theme {
    public name = "Default Dark";
    public disablesStyles: Partial<keyof Styles>[] = ["backgroundImage"];
    public createStyles(options) {
        return {
            ChampsPokemon: {},
        };
    }

    public onThemeInit(editStyle) {
        editStyle({ backgroundImage: "" });
    }

    public onThemePreview() {}
}
