/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
export const classWithDarkTheme = (
    css: any,
    name: string,
    condition: boolean = true,
) => {
    return { [css[name]]: true, [css[`${name}_dark`]]: condition };
};
