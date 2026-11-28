import Color from "color";

export const getContrastColor = (color) => {
    let c;
    try {
        c = Color(color);
    } catch (e) {
        return "#000000";
    }
    if (c && c.isLight()) return "#000000";
    if (c && c.isDark()) return "#FFFFFF";
    return "#000000";
};
