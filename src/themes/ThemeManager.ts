import { Theme } from "./Theme";

export class ThemeManager {
    public currentTheme: Theme;
    public themes: Theme[];

    public constructor(themes) {
        this.themes = themes;
        this.currentTheme = this.themes[0];
    }

    public selectTheme(theme) {
        const exists = this.themes.map((t) => t.name).includes(theme.name);
        if (exists) {
            this.currentTheme = theme;
        }
    }
}
