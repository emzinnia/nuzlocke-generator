export const classWithDarkTheme = (
    css: Record<string, unknown>,
    name: string,
    condition: boolean = true,
) => {
    const baseClass = css[name];
    const darkClass = css[`${name}_dark`];

    return {
        ...(typeof baseClass === "string" ? { [baseClass]: true } : {}),
        ...(typeof darkClass === "string" ? { [darkClass]: condition } : {}),
    };
};
