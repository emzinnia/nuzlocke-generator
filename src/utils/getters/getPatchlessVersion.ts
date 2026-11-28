export const getPatchlessVersion = (v?: string) =>
    v?.match(/^(\d+\.)?(\d+)/)?.[0];
