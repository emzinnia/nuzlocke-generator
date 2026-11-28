import { Theme } from "../Theme";
import { HexagonsTheme } from "../HexagonsTheme";
import { DefaultDarkTheme } from "../DefaultDarkTheme";
import { ThemeManager } from "../ThemeManager";

describe("ThemeManager", () => {
    it("#constructor", () => {
        const manager = new ThemeManager([HexagonsTheme, DefaultDarkTheme]);
        expect(manager.themes.length).toBe(2);
        expect(manager.currentTheme.name).toBe(HexagonsTheme.name);
    });

    it("#selectTheme", () => {
        const manager = new ThemeManager([HexagonsTheme, DefaultDarkTheme]);
        manager.selectTheme(DefaultDarkTheme);
        expect(manager.currentTheme.name).toBe(DefaultDarkTheme.name);
    });

    describe("HexagonsTheme", () => {
        it("#createStyles", () => {
            const theme = new HexagonsTheme();
            expect(theme.createStyles({})).toEqual({ ChampsPokemon: {} });
        });
    });
});
