export const parseNicknamePresetText = (value: string) => {
    const seen = new Set<string>();

    return value
        .split(/[\n,]/)
        .map((name) => name.trim())
        .filter((name) => {
            if (!name || seen.has(name)) return false;
            seen.add(name);
            return true;
        });
};
