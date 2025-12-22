export const classWithDarkTheme = (
    css: any,
    name: string,
    condition: boolean = true,
) => {
    return { [css[name]]: true, [css[`${name}_dark`]]: condition };
};
